const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const { ensureWalletsForUser } = require("../utils/userWallets");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "User route working" });
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    await ensureWalletsForUser(req.user.id);

    const [rows] = await db.execute(
      "SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const u = rows[0];
    res.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        email_verified: Number(u.email_verified) === 1,
        created_at: u.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load profile" });
  }
});

router.patch("/profile", authenticateToken, async (req, res) => {
  try {
    await ensureWalletsForUser(req.user.id);

    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    await db.execute("UPDATE users SET name = ? WHERE id = ?", [name, req.user.id]);

    const [rows] = await db.execute(
      "SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        email_verified: Number(user.email_verified) === 1,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update profile" });
  }
});

module.exports = router;
