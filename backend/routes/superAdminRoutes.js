const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const express = require("express");
const db = require("../config/db");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

let passkeyTableReady = false;

async function ensureAdminPasskeysTable() {
  if (passkeyTableReady) {
    return;
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_registration_passkeys (
      id int(11) NOT NULL AUTO_INCREMENT,
      passkey_hash varchar(255) NOT NULL,
      passkey_value varchar(255) DEFAULT NULL,
      label varchar(120) DEFAULT NULL,
      created_by int(11) NOT NULL,
      used_by int(11) DEFAULT NULL,
      is_active tinyint(1) NOT NULL DEFAULT 1,
      expires_at datetime DEFAULT NULL,
      used_at datetime DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_admin_passkeys_created_by (created_by),
      KEY idx_admin_passkeys_used_by (used_by),
      KEY idx_admin_passkeys_active (is_active),
      CONSTRAINT fk_admin_passkeys_created_by FOREIGN KEY (created_by) REFERENCES users (id),
      CONSTRAINT fk_admin_passkeys_used_by FOREIGN KEY (used_by) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  await db.execute(`
    ALTER TABLE admin_registration_passkeys
    ADD COLUMN IF NOT EXISTS passkey_value varchar(255) DEFAULT NULL AFTER passkey_hash
  `);

  passkeyTableReady = true;
}

router.get("/", (req, res) => {
  res.json({ message: "Super admin route working" });
});

router.use(authenticateToken);
router.use(authorizeRoles("super_admin"));

router.get("/passkeys", async (req, res) => {
  try {
    await ensureAdminPasskeysTable();

    const [rows] = await db.execute(
      `SELECT id, label, passkey_value, is_active, created_by, used_by, expires_at, used_at, created_at, updated_at
       FROM admin_registration_passkeys
       ORDER BY created_at DESC, id DESC`
    );

    res.json({ passkeys: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load admin passkeys" });
  }
});

router.get("/passkeys/:id", async (req, res) => {
  try {
    await ensureAdminPasskeysTable();

    const passkeyId = Number(req.params.id);

    if (!Number.isInteger(passkeyId) || passkeyId <= 0) {
      return res.status(400).json({ message: "Invalid passkey id" });
    }

    const [rows] = await db.execute(
      `SELECT id, label, passkey_value, is_active, created_by, used_by, expires_at, used_at, created_at, updated_at
       FROM admin_registration_passkeys
       WHERE id = ?`,
      [passkeyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Passkey not found" });
    }

    res.json({ passkey: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load admin passkey" });
  }
});

router.post("/passkeys", async (req, res) => {
  try {
    await ensureAdminPasskeysTable();

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
        (passkey_hash, passkey_value, label, created_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [passkeyHash, plainPasskey, label, req.user.id, expiresAt]
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
    await ensureAdminPasskeysTable();

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

router.delete("/passkeys/:id", async (req, res) => {
  try {
    await ensureAdminPasskeysTable();

    const passkeyId = Number(req.params.id);

    if (!Number.isInteger(passkeyId) || passkeyId <= 0) {
      return res.status(400).json({ message: "Invalid passkey id" });
    }

    const [result] = await db.execute(
      "DELETE FROM admin_registration_passkeys WHERE id = ?",
      [passkeyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Passkey not found" });
    }

    res.json({ message: "Passkey deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete admin passkey" });
  }
});

module.exports = router;
