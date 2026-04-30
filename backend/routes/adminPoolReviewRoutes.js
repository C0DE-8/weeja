const express = require("express");
const db = require("../config/db");
const {
  createWalletTransaction,
  ensurePoolScheduleSchema,
  fetchPoolWithOptions,
  fetchPoolsWithOptions,
  normalizeOptionalDateTime,
  normalizeOptionalText,
  toDecimal,
} = require("../utils/poolUtils");
const {
  ensurePoolCreationSchema,
  fetchCreationFeeSettings,
} = require("../utils/poolCreationUtils");

const router = express.Router();

router.get("/settings", async (req, res) => {
  try {
    const settings = await fetchCreationFeeSettings();
    res.json({ fee_settings: settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load creation fee settings" });
  }
});

router.put("/settings/:currencyId", async (req, res) => {
  try {
    await ensurePoolCreationSchema();

    const currencyId = Number(req.params.currencyId);
    const amount = toDecimal(req.body.amount ?? 0, "amount");

    if (!Number.isInteger(currencyId) || currencyId <= 0) {
      return res.status(400).json({ message: "Invalid currency id" });
    }

    if (amount < 0) {
      return res.status(400).json({ message: "amount cannot be negative" });
    }

    const [currencyRows] = await db.execute(
      "SELECT id FROM currencies WHERE id = ? AND status = 'active'",
      [currencyId]
    );

    if (currencyRows.length === 0) {
      return res.status(400).json({ message: "Active currency not found" });
    }

    await db.execute(
      `INSERT INTO pool_creation_fee_settings (currency_id, amount, is_active, created_by, updated_by)
       VALUES (?, ?, 1, ?, ?)
       ON DUPLICATE KEY UPDATE
         amount = VALUES(amount),
         is_active = 1,
         updated_by = VALUES(updated_by)`,
      [currencyId, amount, req.user.id, req.user.id]
    );

    const settings = await fetchCreationFeeSettings();

    res.json({
      message: "Creation fee updated",
      fee_settings: settings,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not update creation fee" });
  }
});

router.get("/", async (req, res) => {
  try {
    const pools = await fetchPoolsWithOptions({
      createdByRole: "user",
      reviewStatus: req.query.review_status,
    });

    res.json({ pools });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not load pool submissions" });
  }
});

router.post("/:id/approve", async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensurePoolScheduleSchema();
    await ensurePoolCreationSchema();

    const poolId = Number(req.params.id);
    const platformFeePercent = toDecimal(
      req.body.platform_fee_percent,
      "platform_fee_percent"
    );
    const reviewNotes = normalizeOptionalText(req.body.review_notes);
    const startTime = normalizeOptionalDateTime(req.body.start_time, "start_time");
    const lockTime = normalizeOptionalDateTime(req.body.lock_time, "lock_time");
    const endTime = normalizeOptionalDateTime(req.body.end_time, "end_time");

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    if (platformFeePercent < 0 || platformFeePercent > 100) {
      return res.status(400).json({
        message: "platform_fee_percent must be between 0 and 100",
      });
    }

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool || pool.created_by_role !== "user") {
      return res.status(404).json({ message: "Pool submission not found" });
    }

    if (pool.review_status !== "under_review") {
      return res.status(400).json({ message: "Pool submission has already been reviewed" });
    }

    const effectiveStartTime = startTime !== undefined ? startTime : pool.start_time;
    const effectiveLockTime = lockTime !== undefined ? lockTime : pool.lock_time;
    const effectiveEndTime = endTime !== undefined ? endTime : pool.end_time;

    if (effectiveLockTime && !effectiveStartTime) {
      return res.status(400).json({ message: "start_time must be set before lock_time" });
    }

    if (
      effectiveLockTime &&
      effectiveStartTime &&
      new Date(effectiveLockTime) <= new Date(effectiveStartTime)
    ) {
      return res.status(400).json({ message: "lock_time must be after start_time" });
    }

    if (effectiveEndTime && !effectiveLockTime) {
      return res.status(400).json({ message: "lock_time must be set before end_time" });
    }

    if (
      effectiveEndTime &&
      effectiveLockTime &&
      new Date(effectiveEndTime) <= new Date(effectiveLockTime)
    ) {
      return res.status(400).json({ message: "end_time must be after lock_time" });
    }

    const fields = [
      "platform_fee_percent = ?",
      "status = 'open'",
      "review_status = 'approved'",
      "review_notes = ?",
      "reviewed_by = ?",
      "reviewed_at = NOW()",
      "approved_at = NOW()",
      "rejected_at = NULL",
    ];
    const values = [platformFeePercent, reviewNotes, req.user.id];

    if (startTime !== undefined) {
      fields.push("start_time = ?");
      values.push(startTime);
    }

    if (lockTime !== undefined) {
      fields.push("lock_time = ?");
      values.push(lockTime);
    }

    if (endTime !== undefined) {
      fields.push("end_time = ?");
      values.push(endTime);
    }

    await connection.execute(
      `UPDATE pools
       SET ${fields.join(", ")}
       WHERE id = ?`,
      [...values, poolId]
    );

    const updatedPool = await fetchPoolWithOptions(connection, poolId);

    res.json({
      message: "Pool approved and published",
      pool: updatedPool,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not approve pool submission" });
  } finally {
    connection.release();
  }
});

router.post("/:id/reject", async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    await ensurePoolCreationSchema();

    const poolId = Number(req.params.id);
    const reviewNotes = normalizeOptionalText(req.body.review_notes);

    if (!Number.isInteger(poolId) || poolId <= 0) {
      return res.status(400).json({ message: "Invalid pool id" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const pool = await fetchPoolWithOptions(connection, poolId);

    if (!pool || pool.created_by_role !== "user") {
      await connection.rollback();
      return res.status(404).json({ message: "Pool submission not found" });
    }

    if (pool.review_status !== "under_review") {
      await connection.rollback();
      return res.status(400).json({ message: "Pool submission has already been reviewed" });
    }

    const feeAmount = Number(pool.creation_fee_amount || 0);

    if (feeAmount > 0 && pool.creation_fee_wallet_id) {
      const [walletRows] = await connection.execute(
        `SELECT id, balance
         FROM user_wallets
         WHERE id = ?
         FOR UPDATE`,
        [pool.creation_fee_wallet_id]
      );

      if (walletRows.length === 0) {
        throw new Error("Creation fee wallet no longer exists");
      }

      const wallet = walletRows[0];
      const newBalance = Number(wallet.balance) + feeAmount;

      await connection.execute(
        `UPDATE user_wallets
         SET balance = ?
         WHERE id = ?`,
        [newBalance, wallet.id]
      );

      await createWalletTransaction(connection, {
        walletId: wallet.id,
        type: "credit",
        amount: feeAmount,
        balanceAfter: newBalance,
        reference: `pool-creation-refund-${pool.id}`,
        description: `Creation fee refund for rejected pool "${pool.title}"`,
      });
    }

    await connection.execute(
      `UPDATE pools
       SET status = 'cancelled',
           review_status = 'rejected',
           review_notes = ?,
           reviewed_by = ?,
           reviewed_at = NOW(),
           rejected_at = NOW(),
           approved_at = NULL
       WHERE id = ?`,
      [reviewNotes, req.user.id, poolId]
    );

    await connection.commit();
    inTransaction = false;

    const updatedPool = await fetchPoolWithOptions(connection, poolId);

    res.json({
      message: "Pool rejected and creation fee refunded",
      pool: updatedPool,
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(400).json({ message: err.message || "Could not reject pool submission" });
  } finally {
    connection.release();
  }
});

module.exports = router;
