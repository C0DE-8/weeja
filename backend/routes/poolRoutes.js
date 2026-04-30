const crypto = require("crypto");
const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  fetchPoolTotals,
  fetchPoolWithOptions,
  fetchPoolsWithOptions,
  createWalletTransaction,
  toDecimal,
} = require("../utils/poolUtils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pools = await fetchPoolsWithOptions({
      status: req.query.status,
      categoryId: req.query.category_id,
      type: req.query.type,
      currencyId: req.query.currency_id,
      reviewStatus: "approved",
    });

    res.json({ pools });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not load pools" });
  }
});

router.get("/:id", async (req, res) => {
  const poolId = Number(req.params.id);

  if (!Number.isInteger(poolId) || poolId <= 0) {
    return res.status(400).json({ message: "Invalid pool id" });
  }

  const connection = await db.getConnection();

  try {
    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool || pool.review_status !== "approved") {
      return res.status(404).json({ message: "Pool not found" });
    }

    res.json({ pool });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load pool" });
  } finally {
    connection.release();
  }
});

router.get("/:id/totals", async (req, res) => {
  const poolId = Number(req.params.id);

  if (!Number.isInteger(poolId) || poolId <= 0) {
    return res.status(400).json({ message: "Invalid pool id" });
  }

  const connection = await db.getConnection();

  try {
    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool || pool.review_status !== "approved") {
      return res.status(404).json({ message: "Pool not found" });
    }

    const totals = await fetchPoolTotals(connection, poolId);

    res.json({
      pool_id: poolId,
      winning_option_id: pool.winning_option_id,
      status: pool.status,
      ...totals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load pool totals" });
  } finally {
    connection.release();
  }
});

router.post("/:id/join", authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    const poolId = Number(req.params.id);
    const poolOptionId = Number(req.body.pool_option_id);
    const stakeAmount = toDecimal(req.body.stake_amount, "stake_amount");

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    if (!Number.isInteger(poolOptionId) || poolOptionId <= 0) {
      return res.status(400).json({ message: "pool_option_id is required" });
    }

    if (stakeAmount <= 0) {
      return res.status(400).json({ message: "stake_amount must be greater than 0" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool) {
      await connection.rollback();
      return res.status(404).json({ message: "Pool not found" });
    }

    if (pool.status !== "open") {
      await connection.rollback();
      return res.status(400).json({ message: "Pool is not open for entries" });
    }

    const now = new Date();

    if (pool.start_time && now < new Date(pool.start_time)) {
      await connection.rollback();
      return res.status(400).json({ message: "Pool has not started yet" });
    }

    if (pool.lock_time && now >= new Date(pool.lock_time)) {
      await connection.rollback();
      return res.status(400).json({ message: "Pool is already locked" });
    }

    if (stakeAmount < Number(pool.min_stake)) {
      await connection.rollback();
      return res.status(400).json({
        message: `Minimum stake is ${pool.min_stake}`,
      });
    }

    const selectedOption = pool.options.find((option) => option.id === poolOptionId);

    if (!selectedOption) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid pool option" });
    }

    const [walletRows] = await connection.execute(
      `SELECT id, balance, status
       FROM user_wallets
       WHERE user_id = ? AND currency_id = ?
       FOR UPDATE`,
      [req.user.id, pool.currency_id]
    );

    if (walletRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Wallet not found for pool currency" });
    }

    const wallet = walletRows[0];

    if (wallet.status !== "active") {
      await connection.rollback();
      return res.status(400).json({ message: "Wallet is not active" });
    }

    const currentBalance = Number(wallet.balance);

    if (currentBalance < stakeAmount) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    const newBalance = currentBalance - stakeAmount;
    const reference = `pool-join-${poolId}-${crypto.randomUUID()}`;

    await connection.execute(
      `UPDATE user_wallets
       SET balance = ?
       WHERE id = ?`,
      [newBalance, wallet.id]
    );

    await createWalletTransaction(connection, {
      walletId: wallet.id,
      type: "debit",
      amount: stakeAmount,
      balanceAfter: newBalance,
      reference,
      description: `Joined pool ${pool.title} with option ${selectedOption.option_label}`,
    });

    const [entryResult] = await connection.execute(
      `INSERT INTO pool_entries
        (pool_id, pool_option_id, user_id, wallet_id, stake_amount, payout_amount, status)
       VALUES (?, ?, ?, ?, ?, 0, 'active')`,
      [poolId, poolOptionId, req.user.id, wallet.id, stakeAmount]
    );

    await connection.commit();
    inTransaction = false;

    res.status(201).json({
      message: "Pool entry created",
      entry_id: entryResult.insertId,
      wallet_balance: newBalance,
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not join pool" });
  } finally {
    connection.release();
  }
});

module.exports = router;
