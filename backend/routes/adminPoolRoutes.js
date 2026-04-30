const express = require("express");
const db = require("../config/db");
const {
  POOL_STATUSES,
  buildPoolUpdateFields,
  createWalletTransaction,
  ensurePoolIsEditable,
  ensurePoolScheduleSchema,
  fetchPoolsWithOptions,
  fetchPoolWithOptions,
  normalizeDateTime,
  normalizeOptionalDateTime,
  normalizeOptionalText,
  normalizeRequiredText,
  requireStatus,
  toDecimal,
} = require("../utils/poolUtils");
const { ensurePoolCreationSchema } = require("../utils/poolCreationUtils");

const router = express.Router();

// api/admin/pools
router.get("/", async (req, res) => {
  try {
    const pools = await fetchPoolsWithOptions({
      status: req.query.status,
      categoryId: req.query.category_id,
      type: req.query.type,
      currencyId: req.query.currency_id,
      reviewStatus: req.query.review_status,
      createdByRole: req.query.created_by_role,
    });

    res.json({ pools });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not load admin pools" });
  }
});

// api/admin/pools/:id
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
    const feePercent = toDecimal(
      req.body.platform_fee_percent ?? 0,
      "platform_fee_percent"
    );
    const startTime = normalizeOptionalDateTime(req.body.start_time, "start_time");
    const lockTime = normalizeOptionalDateTime(req.body.lock_time, "lock_time");
    const endTime = normalizeOptionalDateTime(req.body.end_time, "end_time");
    const status = requireStatus(req.body.status ?? "pending", POOL_STATUSES);
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

    if (feePercent < 0 || feePercent > 100) {
      return res.status(400).json({
        message: "platform_fee_percent must be between 0 and 100",
      });
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

    if (categoryRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "category_id does not exist" });
    }

    if (Number(categoryRows[0].is_active) !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: "category_id is not active" });
    }

    const [currencyRows] = await connection.execute(
      "SELECT id FROM currencies WHERE id = ?",
      [currencyId]
    );

    if (currencyRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "currency_id does not exist" });
    }

    const [result] = await connection.execute(
      `INSERT INTO pools
        (title, description, category_id, currency_id, min_stake, platform_fee_percent, start_time, lock_time, end_time, status, review_status, winning_option_id, created_by, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', NULL, ?, NOW())`,
      [
        title,
        description,
        categoryId,
        currencyId,
        minStake,
        feePercent,
        startTime,
        lockTime,
        endTime,
        status,
        req.user.id,
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
      message: "Pool created",
      pool,
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not create pool" });
  } finally {
    connection.release();
  }
});

// api/admin/pools/:id
router.patch("/:id", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    const existing = await ensurePoolIsEditable(connection, poolId);

    if (!existing) {
      return res.status(404).json({ message: "Pool not found" });
    }

    if (req.body.category_id !== undefined) {
      const categoryId = Number(req.body.category_id);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ message: "category_id must be a positive integer" });
      }

      const [categoryRows] = await connection.execute(
        "SELECT id, is_active FROM categories WHERE id = ?",
        [categoryId]
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({ message: "category_id does not exist" });
      }

      if (Number(categoryRows[0].is_active) !== 1) {
        return res.status(400).json({ message: "category_id is not active" });
      }
    }

    const { fields, values } = buildPoolUpdateFields(req.body, existing);

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    await connection.execute(
      `UPDATE pools
       SET ${fields.join(", ")}
       WHERE id = ?`,
      [...values, poolId]
    );

    const pool = await fetchPoolWithOptions(connection, poolId);

    res.json({
      message: "Pool updated",
      pool,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not update pool" });
  } finally {
    connection.release();
  }
});

router.post("/:id/options", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);
    const optionLabel = normalizeRequiredText(req.body.option_label, "option_label");
    const optionKey = normalizeRequiredText(
      req.body.option_key ?? optionLabel.toLowerCase().replace(/\s+/g, "_"),
      "option_key"
    );

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    const pool = await ensurePoolIsEditable(connection, poolId);

    if (!pool) {
      return res.status(404).json({ message: "Pool not found" });
    }

    const sortOrder =
      req.body.sort_order !== undefined ? Number(req.body.sort_order) : pool.options.length + 1;

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return res.status(400).json({ message: "sort_order must be a non-negative integer" });
    }

    const [result] = await connection.execute(
      `INSERT INTO pool_options
        (pool_id, option_label, option_key, sort_order)
       VALUES (?, ?, ?, ?)`,
      [poolId, optionLabel, optionKey, sortOrder]
    );

    const [rows] = await connection.execute(
      `SELECT id, pool_id, option_label, option_key, sort_order, created_at, updated_at
       FROM pool_options
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Pool option created",
      option: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not create pool option" });
  } finally {
    connection.release();
  }
});

// update api/admin/pools/:id/options/:optionId
router.patch("/:id/options/:optionId", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);
    const optionId = Number(req.params.optionId);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    if (!Number.isInteger(optionId) || optionId <= 0) {
      return res.status(400).json({ message: "Invalid option id" });
    }

    const pool = await ensurePoolIsEditable(connection, poolId);

    if (!pool) {
      return res.status(404).json({ message: "Pool not found" });
    }

    const fields = [];
    const values = [];

    if (req.body.option_label !== undefined) {
      fields.push("option_label = ?");
      values.push(normalizeRequiredText(req.body.option_label, "option_label"));
    }

    if (req.body.option_key !== undefined) {
      fields.push("option_key = ?");
      values.push(normalizeRequiredText(req.body.option_key, "option_key"));
    }

    if (req.body.sort_order !== undefined) {
      const sortOrder = Number(req.body.sort_order);

      if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        return res.status(400).json({ message: "sort_order must be a non-negative integer" });
      }

      fields.push("sort_order = ?");
      values.push(sortOrder);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const [result] = await connection.execute(
      `UPDATE pool_options
       SET ${fields.join(", ")}
       WHERE id = ? AND pool_id = ?`,
      [...values, optionId, poolId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pool option not found" });
    }

    const [rows] = await connection.execute(
      `SELECT id, pool_id, option_label, option_key, sort_order, created_at, updated_at
       FROM pool_options
       WHERE id = ?`,
      [optionId]
    );

    res.json({
      message: "Pool option updated",
      option: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not update pool option" });
  } finally {
    connection.release();
  }
});

// delete api/admin/pools/:id/options/:optionId 
router.delete("/:id/options/:optionId", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);
    const optionId = Number(req.params.optionId);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    if (!Number.isInteger(optionId) || optionId <= 0) {
      return res.status(400).json({ message: "Invalid option id" });
    }

    const pool = await ensurePoolIsEditable(connection, poolId);

    if (!pool) {
      return res.status(404).json({ message: "Pool not found" });
    }

    if (pool.winning_option_id === optionId) {
      return res.status(400).json({ message: "Cannot delete the winning option" });
    }

    const [entryRows] = await connection.execute(
      "SELECT COUNT(*) AS total FROM pool_entries WHERE pool_option_id = ?",
      [optionId]
    );

    if (Number(entryRows[0].total) > 0) {
      return res.status(400).json({
        message: "Cannot delete an option that already has entries",
      });
    }

    const [optionCountRows] = await connection.execute(
      "SELECT COUNT(*) AS total FROM pool_options WHERE pool_id = ?",
      [poolId]
    );

    if (Number(optionCountRows[0].total) <= 2) {
      return res.status(400).json({ message: "Pool must have at least two options" });
    }

    const [result] = await connection.execute(
      "DELETE FROM pool_options WHERE id = ? AND pool_id = ?",
      [optionId, poolId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pool option not found" });
    }

    res.json({ message: "Pool option deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not delete pool option" });
  } finally {
    connection.release();
  }
});

router.post("/:id/lock", async (req, res) => {
  try {
    const poolId = Number(req.params.id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    const [result] = await db.execute(
      `UPDATE pools
       SET status = 'locked'
       WHERE id = ? AND status IN ('pending', 'open')`,
      [poolId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Pool could not be locked" });
    }

    res.json({ message: "Pool locked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not lock pool" });
  }
});

router.post("/:id/result", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const poolId = Number(req.params.id);
    const winningOptionId = Number(req.body.winning_option_id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    if (!Number.isInteger(winningOptionId) || winningOptionId <= 0) {
      return res.status(400).json({ message: "winning_option_id is required" });
    }

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool) {
      return res.status(404).json({ message: "Pool not found" });
    }

    if (!["locked", "awaiting_result"].includes(pool.status)) {
      return res.status(400).json({
        message: "Pool must be locked before setting a result",
      });
    }

    const hasOption = pool.options.some((option) => option.id === winningOptionId);

    if (!hasOption) {
      return res.status(400).json({ message: "winning_option_id is not in this pool" });
    }

    await connection.execute(
      `UPDATE pools
       SET winning_option_id = ?, status = 'awaiting_result', end_time = COALESCE(end_time, NOW())
       WHERE id = ?`,
      [winningOptionId, poolId]
    );

    const updatedPool = await fetchPoolWithOptions(connection, poolId);

    res.json({
      message: "Pool result recorded",
      pool: updatedPool,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not set pool result" });
  } finally {
    connection.release();
  }
});

router.post("/:id/settle", async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    const poolId = Number(req.params.id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool) {
      await connection.rollback();
      return res.status(404).json({ message: "Pool not found" });
    }

    if (pool.status !== "awaiting_result" || !pool.winning_option_id) {
      await connection.rollback();
      return res.status(400).json({
        message: "Pool must have a winning_option_id and be awaiting_result",
      });
    }

    const [entries] = await connection.execute(
      `SELECT id, pool_option_id, wallet_id, stake_amount, status
       FROM pool_entries
       WHERE pool_id = ?
       FOR UPDATE`,
      [poolId]
    );

    const activeEntries = entries.filter((entry) => entry.status === "active");
    const winningEntries = activeEntries.filter(
      (entry) => entry.pool_option_id === pool.winning_option_id
    );
    const losingEntries = activeEntries.filter(
      (entry) => entry.pool_option_id !== pool.winning_option_id
    );

    if (activeEntries.length === 0) {
      await connection.execute(
        "UPDATE pools SET status = 'settled' WHERE id = ?",
        [poolId]
      );
      await connection.commit();
      inTransaction = false;
      return res.json({ message: "Pool settled with no active entries" });
    }

    if (winningEntries.length === 0) {
      for (const entry of activeEntries) {
        const [walletRows] = await connection.execute(
          `SELECT id, balance
           FROM user_wallets
           WHERE id = ?
           FOR UPDATE`,
          [entry.wallet_id]
        );

        const wallet = walletRows[0];
        const newBalance = Number(wallet.balance) + Number(entry.stake_amount);

        await connection.execute(
          `UPDATE user_wallets
           SET balance = ?
           WHERE id = ?`,
          [newBalance, entry.wallet_id]
        );

        await createWalletTransaction(connection, {
          walletId: entry.wallet_id,
          type: "credit",
          amount: Number(entry.stake_amount),
          balanceAfter: newBalance,
          reference: `pool-refund-${poolId}-${entry.id}`,
          description: `Refund for pool ${pool.title} because nobody picked the winning option`,
        });

        await connection.execute(
          `UPDATE pool_entries
           SET payout_amount = ?, status = 'refunded'
           WHERE id = ?`,
          [entry.stake_amount, entry.id]
        );
      }

      await connection.execute(
        "UPDATE pools SET status = 'settled' WHERE id = ?",
        [poolId]
      );

        await connection.commit();
        inTransaction = false;

        return res.json({
          message: "No winning entries found. All users refunded.",
      });
    }

    const totalWinningStake = winningEntries.reduce(
      (sum, entry) => sum + Number(entry.stake_amount),
      0
    );
    const totalLosingStake = losingEntries.reduce(
      (sum, entry) => sum + Number(entry.stake_amount),
      0
    );
    const feeAmount = (totalLosingStake * Number(pool.platform_fee_percent)) / 100;
    const rewardPool = totalLosingStake - feeAmount;

    for (const entry of winningEntries) {
      const stake = Number(entry.stake_amount);
      const rewardShare =
        totalWinningStake > 0 ? (stake / totalWinningStake) * rewardPool : 0;
      const payoutAmount = stake + rewardShare;

      const [walletRows] = await connection.execute(
        `SELECT id, balance
         FROM user_wallets
         WHERE id = ?
         FOR UPDATE`,
        [entry.wallet_id]
      );

      const wallet = walletRows[0];
      const newBalance = Number(wallet.balance) + payoutAmount;

      await connection.execute(
        `UPDATE user_wallets
         SET balance = ?
         WHERE id = ?`,
        [newBalance, entry.wallet_id]
      );

      await createWalletTransaction(connection, {
        walletId: entry.wallet_id,
        type: "credit",
        amount: payoutAmount,
        balanceAfter: newBalance,
        reference: `pool-payout-${poolId}-${entry.id}`,
        description: `Payout for winning pool entry in ${pool.title}`,
      });

      await connection.execute(
        `UPDATE pool_entries
         SET payout_amount = ?, status = 'won'
         WHERE id = ?`,
        [payoutAmount, entry.id]
      );
    }

    for (const entry of losingEntries) {
      await connection.execute(
        `UPDATE pool_entries
         SET payout_amount = 0, status = 'lost'
         WHERE id = ?`,
        [entry.id]
      );
    }

    await connection.execute(
      "UPDATE pools SET status = 'settled' WHERE id = ?",
      [poolId]
    );

    await connection.commit();
    inTransaction = false;

    res.json({
      message: "Pool settled successfully",
      totals: {
        total_winning_stake: totalWinningStake,
        total_losing_stake: totalLosingStake,
        fee_amount: feeAmount,
        reward_pool: rewardPool,
      },
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not settle pool" });
  } finally {
    connection.release();
  }
});

// api/admin/pools/:id/cancel
router.post("/:id/cancel", async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    const poolId = Number(req.params.id);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool) {
      await connection.rollback();
      return res.status(404).json({ message: "Pool not found" });
    }

    if (pool.status === "settled" || pool.status === "cancelled") {
      await connection.rollback();
      return res.status(400).json({ message: "Pool cannot be cancelled" });
    }

    const [entries] = await connection.execute(
      `SELECT id, wallet_id, stake_amount, status
       FROM pool_entries
       WHERE pool_id = ?
       FOR UPDATE`,
      [poolId]
    );

    for (const entry of entries) {
      if (entry.status !== "active") {
        continue;
      }

      const [walletRows] = await connection.execute(
        `SELECT id, balance
         FROM user_wallets
         WHERE id = ?
         FOR UPDATE`,
        [entry.wallet_id]
      );

      const wallet = walletRows[0];
      const newBalance = Number(wallet.balance) + Number(entry.stake_amount);

      await connection.execute(
        `UPDATE user_wallets
         SET balance = ?
         WHERE id = ?`,
        [newBalance, entry.wallet_id]
      );

      await createWalletTransaction(connection, {
        walletId: entry.wallet_id,
        type: "credit",
        amount: Number(entry.stake_amount),
        balanceAfter: newBalance,
        reference: `pool-cancel-${poolId}-${entry.id}`,
        description: `Refund for cancelled pool ${pool.title}`,
      });

      await connection.execute(
        `UPDATE pool_entries
         SET payout_amount = ?, status = 'refunded'
         WHERE id = ?`,
        [entry.stake_amount, entry.id]
      );
    }

    await connection.execute(
      `UPDATE pools
       SET status = 'cancelled'
       WHERE id = ?`,
      [poolId]
    );

    await connection.commit();
    inTransaction = false;

    res.json({ message: "Pool cancelled and active entries refunded" });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not cancel pool" });
  } finally {
    connection.release();
  }
});

module.exports = router;
