const db = require("../config/db");

const POOL_STATUSES = new Set([
  "pending",
  "open",
  "locked",
  "awaiting_result",
  "settled",
  "cancelled",
]);

function toDecimal(value, fieldName) {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  return num;
}

function normalizeOptionalText(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeRequiredText(value, fieldName) {
  const text = normalizeOptionalText(value);

  if (!text) {
    throw new Error(`${fieldName} is required`);
  }

  return text;
}

function normalizeDateTime(value, fieldName) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid datetime`);
  }

  return date;
}

function requireStatus(status, allowedStatuses, fieldName = "status") {
  if (!allowedStatuses.has(status)) {
    throw new Error(`${fieldName} is invalid`);
  }

  return status;
}

async function fetchPoolOptions(connection, poolId) {
  const [rows] = await connection.execute(
    `SELECT id, pool_id, option_label, option_key, sort_order, created_at, updated_at
     FROM pool_options
     WHERE pool_id = ?
     ORDER BY sort_order ASC, id ASC`,
    [poolId]
  );

  return rows;
}

async function fetchPoolWithOptions(connection, poolId) {
  const [pools] = await connection.execute(
    `SELECT
        p.id,
        p.title,
        p.description,
        p.category,
        p.currency_id,
        c.code AS currency_code,
        c.name AS currency_name,
        p.min_stake,
        p.platform_fee_percent,
        p.start_time,
        p.lock_time,
        p.status,
        p.winning_option_id,
        p.created_by,
        creator.name AS created_by_name,
        p.created_at,
        p.updated_at
      FROM pools p
      INNER JOIN currencies c ON c.id = p.currency_id
      INNER JOIN users creator ON creator.id = p.created_by
      WHERE p.id = ?`,
    [poolId]
  );

  if (pools.length === 0) {
    return null;
  }

  const pool = pools[0];
  pool.options = await fetchPoolOptions(connection, poolId);

  return pool;
}

async function fetchPoolTotals(connection, poolId) {
  const [summaryRows] = await connection.execute(
    `SELECT
        COUNT(*) AS total_entries,
        COALESCE(SUM(stake_amount), 0) AS total_staked,
        COALESCE(SUM(CASE WHEN status = 'active' THEN stake_amount ELSE 0 END), 0) AS active_stake,
        COALESCE(SUM(CASE WHEN status = 'won' THEN payout_amount ELSE 0 END), 0) AS settled_payout,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN payout_amount ELSE 0 END), 0) AS refunded_amount
      FROM pool_entries
      WHERE pool_id = ?`,
    [poolId]
  );

  const [optionRows] = await connection.execute(
    `SELECT
        po.id AS pool_option_id,
        po.option_label,
        po.option_key,
        po.sort_order,
        COUNT(pe.id) AS total_entries,
        COALESCE(SUM(pe.stake_amount), 0) AS total_staked,
        COALESCE(SUM(CASE WHEN pe.status = 'active' THEN pe.stake_amount ELSE 0 END), 0) AS active_stake
      FROM pool_options po
      LEFT JOIN pool_entries pe ON pe.pool_option_id = po.id
      WHERE po.pool_id = ?
      GROUP BY po.id, po.option_label, po.option_key, po.sort_order
      ORDER BY po.sort_order ASC, po.id ASC`,
    [poolId]
  );

  return {
    summary: summaryRows[0],
    options: optionRows,
  };
}

async function ensurePoolIsEditable(connection, poolId) {
  const pool = await fetchPoolWithOptions(connection, poolId);

  if (!pool) {
    return null;
  }

  if (pool.status === "settled" || pool.status === "cancelled") {
    throw new Error("Pool can no longer be modified");
  }

  return pool;
}

async function createWalletTransaction(connection, {
  walletId,
  type,
  amount,
  balanceAfter,
  reference,
  description,
}) {
  await connection.execute(
    `INSERT INTO wallet_transactions
      (wallet_id, type, amount, balance_after, reference, status, description)
     VALUES (?, ?, ?, ?, ?, 'completed', ?)`,
    [walletId, type, amount, balanceAfter, reference, description]
  );
}

function buildPoolUpdateFields(payload, existingPool) {
  const fields = [];
  const values = [];

  if (payload.title !== undefined) {
    fields.push("title = ?");
    values.push(normalizeRequiredText(payload.title, "title"));
  }

  if (payload.description !== undefined) {
    fields.push("description = ?");
    values.push(normalizeOptionalText(payload.description));
  }

  if (payload.category !== undefined) {
    fields.push("category = ?");
    values.push(normalizeRequiredText(payload.category, "category"));
  }

  if (payload.currency_id !== undefined) {
    const currencyId = Number(payload.currency_id);

    if (!Number.isInteger(currencyId) || currencyId <= 0) {
      throw new Error("currency_id must be a positive integer");
    }

    fields.push("currency_id = ?");
    values.push(currencyId);
  }

  if (payload.min_stake !== undefined) {
    const minStake = toDecimal(payload.min_stake, "min_stake");

    if (minStake < 0) {
      throw new Error("min_stake cannot be negative");
    }

    fields.push("min_stake = ?");
    values.push(minStake);
  }

  if (payload.platform_fee_percent !== undefined) {
    const feePercent = toDecimal(payload.platform_fee_percent, "platform_fee_percent");

    if (feePercent < 0 || feePercent > 100) {
      throw new Error("platform_fee_percent must be between 0 and 100");
    }

    fields.push("platform_fee_percent = ?");
    values.push(feePercent);
  }

  let startTime;
  let lockTime;

  if (payload.start_time !== undefined) {
    startTime = normalizeDateTime(payload.start_time, "start_time");
    fields.push("start_time = ?");
    values.push(startTime);
  }

  if (payload.lock_time !== undefined) {
    lockTime = normalizeDateTime(payload.lock_time, "lock_time");
    fields.push("lock_time = ?");
    values.push(lockTime);
  }

  const effectiveStartTime = startTime || new Date(existingPool.start_time);
  const effectiveLockTime = lockTime || new Date(existingPool.lock_time);

  if (effectiveLockTime <= effectiveStartTime) {
    throw new Error("lock_time must be after start_time");
  }

  if (payload.status !== undefined) {
    fields.push("status = ?");
    values.push(requireStatus(payload.status, POOL_STATUSES));
  }

  return { fields, values };
}

async function fetchPoolsWithOptions(filters = {}) {
  const { status, category, currencyId } = filters;
  const where = [];
  const params = [];

  if (status) {
    if (!POOL_STATUSES.has(status)) {
      throw new Error("Invalid status filter");
    }

    where.push("p.status = ?");
    params.push(status);
  }

  if (category) {
    where.push("p.category = ?");
    params.push(category);
  }

  if (currencyId !== undefined) {
    if (!Number.isInteger(Number(currencyId)) || Number(currencyId) <= 0) {
      throw new Error("Invalid currency_id filter");
    }

    where.push("p.currency_id = ?");
    params.push(Number(currencyId));
  }

  const sql = `
    SELECT
      p.id,
      p.title,
      p.description,
      p.category,
      p.currency_id,
      c.code AS currency_code,
      c.name AS currency_name,
      p.min_stake,
      p.platform_fee_percent,
      p.start_time,
      p.lock_time,
      p.status,
      p.winning_option_id,
      p.created_by,
      creator.name AS created_by_name,
      p.created_at,
      p.updated_at
    FROM pools p
    INNER JOIN currencies c ON c.id = p.currency_id
    INNER JOIN users creator ON creator.id = p.created_by
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY p.created_at DESC, p.id DESC`;

  const [pools] = await db.execute(sql, params);

  if (pools.length === 0) {
    return [];
  }

  const poolIds = pools.map((pool) => pool.id);
  const [options] = await db.query(
    `SELECT id, pool_id, option_label, option_key, sort_order, created_at, updated_at
     FROM pool_options
     WHERE pool_id IN (?)
     ORDER BY pool_id ASC, sort_order ASC, id ASC`,
    [poolIds]
  );

  const optionMap = new Map();

  for (const option of options) {
    if (!optionMap.has(option.pool_id)) {
      optionMap.set(option.pool_id, []);
    }

    optionMap.get(option.pool_id).push(option);
  }

  return pools.map((pool) => ({
    ...pool,
    options: optionMap.get(pool.id) || [],
  }));
}

module.exports = {
  POOL_STATUSES,
  buildPoolUpdateFields,
  createWalletTransaction,
  ensurePoolIsEditable,
  fetchPoolOptions,
  fetchPoolTotals,
  fetchPoolWithOptions,
  fetchPoolsWithOptions,
  normalizeDateTime,
  normalizeOptionalText,
  normalizeRequiredText,
  requireStatus,
  toDecimal,
};
