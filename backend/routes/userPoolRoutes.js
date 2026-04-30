const crypto = require("crypto");
const express = require("express");
const db = require("../config/db");
const {
  createWalletTransaction,
  ensurePoolScheduleSchema,
  fetchPoolWithOptions,
  fetchPoolsWithOptions,
  normalizeOptionalDateTime,
  normalizeOptionalText,
  normalizeRequiredText,
  toDecimal,
} = require("../utils/poolUtils");
const {
  ensurePoolCreationSchema,
  fetchCreationFeeSettingByCurrency,
  fetchCreationFeeSettings,
} = require("../utils/poolCreationUtils");

const router = express.Router();

router.get("/meta", async (req, res) => {
  try {
    await ensurePoolCreationSchema();

    const [currencies] = await db.execute(
      `SELECT id, code, name, status
       FROM currencies
       WHERE status = 'active'
       ORDER BY code ASC`
    );
    const feeSettings = await fetchCreationFeeSettings();

    res.json({
      currencies,
      fee_settings: feeSettings.filter((setting) => Number(setting.is_active) === 1),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load pool submission metadata" });
  }
});

router.get("/", async (req, res) => {
  try {
    const pools = await fetchPoolsWithOptions({
      createdByUserId: req.user.id,
    });

    res.json({ pools });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not load your pool submissions" });
  }
});

router.get("/:id", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool || Number(pool.created_by) !== Number(req.user.id)) {
      return res.status(404).json({ message: "Pool submission not found" });
    }

    res.json({ pool });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load pool submission" });
  } finally {
    connection.release();
  }
});

router.post("/", async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    await ensurePoolScheduleSchema();
    await ensurePoolCreationSchema();

    const title = normalizeRequiredText(req.body.title, "title");
    const description = normalizeOptionalText(req.body.description);
    const categoryId = Number(req.body.category_id);
    const currencyId = Number(req.body.currency_id);
    const minStake = toDecimal(req.body.min_stake ?? 0, "min_stake");
    const startTime = normalizeOptionalDateTime(req.body.start_time, "start_time");
    const lockTime = normalizeOptionalDateTime(req.body.lock_time, "lock_time");
    const endTime = normalizeOptionalDateTime(req.body.end_time, "end_time");
    const optionsPayload = Array.isArray(req.body.options) ? req.body.options : [];

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: "category_id must be a positive integer" });
    }

    if (!Number.isInteger(currencyId) || currencyId <= 0) {
      return res.status(400).json({ message: "currency_id must be a positive integer" });
    }

    if (minStake < 0) {
      return res.status(400).json({ message: "min_stake cannot be negative" });
    }

    if (lockTime && !startTime) {
      return res.status(400).json({ message: "start_time must be set before lock_time" });
    }

    if (lockTime && startTime && lockTime <= startTime) {
      return res.status(400).json({ message: "lock_time must be after start_time" });
    }

    if (endTime && !lockTime) {
      return res.status(400).json({ message: "lock_time must be set before end_time" });
    }

    if (endTime && lockTime && endTime <= lockTime) {
      return res.status(400).json({ message: "end_time must be after lock_time" });
    }

    if (optionsPayload.length < 2) {
      return res.status(400).json({ message: "A pool must have at least two options" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const [categoryRows] = await connection.execute(
      "SELECT id, is_active FROM categories WHERE id = ?",
      [categoryId]
    );

    if (categoryRows.length === 0 || Number(categoryRows[0].is_active) !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: "category_id is not active" });
    }

    const [currencyRows] = await connection.execute(
      "SELECT id, code, name, status FROM currencies WHERE id = ?",
      [currencyId]
    );

    if (currencyRows.length === 0 || currencyRows[0].status !== "active") {
      await connection.rollback();
      return res.status(400).json({ message: "currency_id is not active" });
    }

    const feeSetting = await fetchCreationFeeSettingByCurrency(connection, currencyId);

    if (!feeSetting || Number(feeSetting.is_active) !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: "Creation fee is not configured for this currency" });
    }

    const creationFeeAmount = Number(feeSetting.amount);
    let creationFeeWalletId = null;
    let walletBalance = null;

    if (creationFeeAmount > 0) {
      const [walletRows] = await connection.execute(
        `SELECT id, balance, status
         FROM user_wallets
         WHERE user_id = ? AND currency_id = ?
         FOR UPDATE`,
        [req.user.id, currencyId]
      );

      if (walletRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: "Wallet not found for selected currency" });
      }

      const wallet = walletRows[0];

      if (wallet.status !== "active") {
        await connection.rollback();
        return res.status(400).json({ message: "Wallet is not active" });
      }

      const currentBalance = Number(wallet.balance);

      if (currentBalance < creationFeeAmount) {
        await connection.rollback();
        return res.status(400).json({
          message: `Insufficient wallet balance for the ${feeSetting.currency_code} creation fee`,
        });
      }

      walletBalance = currentBalance - creationFeeAmount;
      creationFeeWalletId = wallet.id;

      await connection.execute(
        `UPDATE user_wallets
         SET balance = ?
         WHERE id = ?`,
        [walletBalance, wallet.id]
      );

      await createWalletTransaction(connection, {
        walletId: wallet.id,
        type: "debit",
        amount: creationFeeAmount,
        balanceAfter: walletBalance,
        reference: `pool-creation-fee-${crypto.randomUUID()}`,
        description: `Creation fee hold for user pool "${title}"`,
      });
    }

    const [result] = await connection.execute(
      `INSERT INTO pools
        (title, description, category_id, currency_id, min_stake, platform_fee_percent, start_time, lock_time, end_time, status, review_status, winning_option_id, created_by, creation_fee_amount, creation_fee_wallet_id)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'pending', 'under_review', NULL, ?, ?, ?)`,
      [
        title,
        description,
        categoryId,
        currencyId,
        minStake,
        startTime,
        lockTime,
        endTime,
        req.user.id,
        creationFeeAmount,
        creationFeeWalletId,
      ]
    );

    const poolId = result.insertId;

    for (let index = 0; index < optionsPayload.length; index += 1) {
      const option = optionsPayload[index];
      const optionLabel = normalizeRequiredText(option.option_label, "option_label");
      const optionKey = normalizeRequiredText(
        option.option_key ?? optionLabel.toLowerCase().replace(/\s+/g, "_"),
        "option_key"
      );
      const sortOrder =
        option.sort_order !== undefined ? Number(option.sort_order) : index + 1;

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw new Error("sort_order must be a non-negative integer");
      }

      await connection.execute(
        `INSERT INTO pool_options
          (pool_id, option_label, option_key, sort_order)
         VALUES (?, ?, ?, ?)`,
        [poolId, optionLabel, optionKey, sortOrder]
      );
    }

    await connection.commit();
    inTransaction = false;

    const pool = await fetchPoolWithOptions(connection, poolId);

    res.status(201).json({
      message: "Pool submitted for admin review",
      pool,
      creation_fee_amount: creationFeeAmount,
      wallet_balance: walletBalance,
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not submit pool" });
  } finally {
    connection.release();
  }
});

module.exports = router;
