const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Super admin route working" });
});

router.use(authenticateToken);
router.use(authorizeRoles("super_admin"));

router.get("/passkeys", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, label, is_active, created_by, used_by, expires_at, used_at, created_at, updated_at
       FROM admin_registration_passkeys
       ORDER BY created_at DESC, id DESC`
    );

    res.json({ passkeys: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load admin passkeys" });
  }
});

router.post("/passkeys", async (req, res) => {
  try {
    const plainPasskey = typeof req.body.passkey === "string" && req.body.passkey.trim()
      ? req.body.passkey.trim()
      : crypto.randomBytes(8).toString("hex");
    const label =
      typeof req.body.label === "string" && req.body.label.trim()
        ? req.body.label.trim()
        : null;

    let expiresAt = null;

    if (req.body.expires_at !== undefined && req.body.expires_at !== null && req.body.expires_at !== "") {
      expiresAt = new Date(req.body.expires_at);

      if (Number.isNaN(expiresAt.getTime())) {
        return res.status(400).json({ message: "expires_at must be a valid datetime" });
      }
    }

    if (plainPasskey.length < 6) {
      return res.status(400).json({ message: "passkey must be at least 6 characters" });
    }

    const passkeyHash = await bcrypt.hash(plainPasskey, 10);

    const [result] = await db.execute(
      `INSERT INTO admin_registration_passkeys
        (passkey_hash, label, created_by, expires_at)
       VALUES (?, ?, ?, ?)`,
      [passkeyHash, label, req.user.id, expiresAt]
    );

    res.status(201).json({
      message: "Admin registration passkey created",
      passkey: {
        id: result.insertId,
        label,
        passkey: plainPasskey,
        expires_at: expiresAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create admin passkey" });
  }
});

router.post("/passkeys/:id/deactivate", async (req, res) => {
  try {
    const passkeyId = Number(req.params.id);

    if (!Number.isInteger(passkeyId) || passkeyId <= 0) {
      return res.status(400).json({ message: "Invalid passkey id" });
    }

    const [result] = await db.execute(
      `UPDATE admin_registration_passkeys
       SET is_active = 0
       WHERE id = ?`,
      [passkeyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Passkey not found" });
    }

    res.json({ message: "Passkey deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not deactivate admin passkey" });
  }
});

module.exports = router;
