const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const { ensureCurrencyDecimalPlacesSchema } = require("../utils/currencyUtils");
const { ensureWalletsForUser } = require("../utils/userWallets");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    await ensureCurrencyDecimalPlacesSchema();
    await ensureWalletsForUser(req.user.id);

    const [wallets] = await db.execute(
      `SELECT
          w.id,
          w.user_id,
          w.currency_id,
          w.balance,
          w.status,
          c.code AS currency_code,
          c.name AS currency_name,
          c.decimal_places,
          w.created_at,
          w.updated_at
        FROM user_wallets w
        INNER JOIN currencies c ON c.id = w.currency_id
        WHERE w.user_id = ?
        ORDER BY c.code ASC`,
      [req.user.id]
    );

    res.json({ wallets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load wallets" });
  }
});

router.get("/transactions", authenticateToken, async (req, res) => {
  try {
    await ensureCurrencyDecimalPlacesSchema();
    await ensureWalletsForUser(req.user.id);

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const [transactions] = await db.execute(
      `SELECT
          tx.id,
          tx.wallet_id,
          tx.type,
          tx.amount,
          tx.balance_after,
          tx.reference,
          tx.status,
          tx.description,
          tx.created_at,
          c.code AS currency_code,
          c.name AS currency_name,
          c.decimal_places
        FROM wallet_transactions tx
        INNER JOIN user_wallets w ON w.id = tx.wallet_id
        INNER JOIN currencies c ON c.id = w.currency_id
        WHERE w.user_id = ?
        ORDER BY tx.created_at DESC, tx.id DESC
        LIMIT ?`,
      [req.user.id, limit]
    );

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load wallet transactions" });
  }
});

module.exports = router;
