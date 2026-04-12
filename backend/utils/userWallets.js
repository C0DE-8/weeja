const db = require("../config/db");

/**
 * Ensures a wallet row exists for each active currency (balance 0).
 * Safe to call after email verification; uses INSERT IGNORE + unique (user_id, currency_id).
 */
async function ensureWalletsForUser(userId) {
  const [currencies] = await db.execute(
    "SELECT id FROM currencies WHERE status = 'active'"
  );
  for (const row of currencies) {
    await db.execute(
      `INSERT IGNORE INTO user_wallets (user_id, currency_id, balance, status)
       VALUES (?, ?, 0, 'active')`,
      [userId, row.id]
    );
  }
}

module.exports = { ensureWalletsForUser };
