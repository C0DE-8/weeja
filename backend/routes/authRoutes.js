const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { sendMail } = require("../utils/email");
const { verificationOtpTemplate } = require("../templates/mail/verificationOtp");
const { ensureWalletsForUser } = require("../utils/userWallets");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

const OTP_TTL_MS = 15 * 60 * 1000;

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function isStrongEnoughPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

async function issueOtpForUser(userId, email, plainOtp) {
  const otpHash = await bcrypt.hash(plainOtp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.execute(
    "UPDATE users SET otp_hash = ?, otp_expires_at = ? WHERE id = ?",
    [otpHash, expiresAt, userId]
  );
  const expiresMinutes = OTP_TTL_MS / 60000;
  const { subject, text, html } = verificationOtpTemplate({
    otp: plainOtp,
    expiresMinutes,
  });
  await sendMail({ to: email, subject, text, html });
}

router.get("/", (req, res) => {
  res.json({ message: "Auth route working" });
});

/**
 * REGISTER — creates or refreshes a pending account; sends OTP email
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !trimmedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [existing] = await db.execute(
      "SELECT id, email_verified FROM users WHERE email = ?",
      [trimmedEmail]
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    const plainOtp = generateOtp();

    if (existing.length > 0) {
      const row = existing[0];
      if (Number(row.email_verified) === 1) {
        return res.status(400).json({ message: "Email already exists" });
      }
      await db.execute(
        "UPDATE users SET name = ?, password = ?, email_verified = 0 WHERE id = ?",
        [name.trim(), hashedPassword, row.id]
      );
      try {
        await issueOtpForUser(row.id, trimmedEmail, plainOtp);
      } catch (mailErr) {
        console.error(mailErr);
        return res.status(500).json({ message: "Could not send verification email" });
      }
      return res.status(201).json({
        message: "Verification code sent to your email",
        userId: row.id,
      });
    }

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), trimmedEmail, hashedPassword, "user", 0]
    );
    const userId = result.insertId;

    try {
      await issueOtpForUser(userId, trimmedEmail, plainOtp);
    } catch (mailErr) {
      console.error(mailErr);
      await db.execute("DELETE FROM users WHERE id = ?", [userId]);
      return res.status(500).json({ message: "Could not send verification email" });
    }

    res.status(201).json({
      message: "Verification code sent to your email",
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Register error" });
  }
});

router.post("/register-admin", async (req, res) => {
  const connection = await db.getConnection();
  let inTransaction = false;

  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body.password;
    const passkey = typeof req.body.passkey === "string" ? req.body.passkey.trim() : "";

    if (!username || !email || !password || !passkey) {
      return res.status(400).json({
        message: "username, email, password, and passkey are required",
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "username must be at least 3 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    await connection.beginTransaction();
    inTransaction = true;

    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ? OR name = ? LIMIT 1",
      [email, username]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({ message: "Email or username already exists" });
    }

    const [passkeyRows] = await connection.execute(
      `SELECT id, passkey_hash, is_active, expires_at, used_by, used_at
       FROM admin_registration_passkeys
       WHERE is_active = 1 AND used_at IS NULL
       ORDER BY created_at ASC`,
    );

    let matchedPasskey = null;

    for (const row of passkeyRows) {
      const isMatch = await bcrypt.compare(passkey, row.passkey_hash);

      if (!isMatch) {
        continue;
      }

      if (row.used_by || row.used_at) {
        continue;
      }

      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        continue;
      }

      matchedPasskey = row;
      break;
    }

    if (!matchedPasskey) {
      await connection.rollback();
      inTransaction = false;
      return res.status(400).json({ message: "Invalid or expired admin passkey" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      `INSERT INTO users (name, email, password, role, email_verified)
       VALUES (?, ?, ?, 'admin', 1)`,
      [username, email, hashedPassword]
    );

    await connection.execute(
      `UPDATE admin_registration_passkeys
       SET used_by = ?, used_at = NOW(), is_active = 0
       WHERE id = ?`,
      [result.insertId, matchedPasskey.id]
    );

    await connection.commit();
    inTransaction = false;

    try {
      await ensureWalletsForUser(result.insertId);
    } catch (walletErr) {
      console.error(walletErr);
    }

    res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: result.insertId,
        name: username,
        email,
        role: "admin",
      },
    });
  } catch (err) {
    if (inTransaction) {
      await connection.rollback();
    }
    console.error(err);
    res.status(500).json({ message: "Admin registration error" });
  } finally {
    connection.release();
  }
});

/**
 * VERIFY OTP — activates account and creates wallet rows per currency
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }

    const [users] = await db.execute(
      "SELECT id, otp_hash, otp_expires_at, email_verified FROM users WHERE email = ?",
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const user = users[0];
    if (Number(user.email_verified) === 1) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    if (!user.otp_hash || !user.otp_expires_at) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    const expires = new Date(user.otp_expires_at).getTime();
    if (Number.isNaN(expires) || Date.now() > expires) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    const match = await bcrypt.compare(otp, user.otp_hash);
    if (!match) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    await db.execute(
      "UPDATE users SET email_verified = 1, otp_hash = NULL, otp_expires_at = NULL WHERE id = ?",
      [user.id]
    );

    try {
      await ensureWalletsForUser(user.id);
    } catch (walletErr) {
      console.error(walletErr);
    }

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification error" });
  }
});

/**
 * RESEND OTP — same response whether or not the email is pending (avoid email enumeration)
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!trimmedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const [users] = await db.execute(
      "SELECT id, email_verified FROM users WHERE email = ?",
      [trimmedEmail]
    );

    if (users.length === 0 || Number(users[0].email_verified) === 1) {
      return res.json({
        message: "If an account needs verification, a new code has been sent",
      });
    }

    const plainOtp = generateOtp();
    try {
      await issueOtpForUser(users[0].id, trimmedEmail, plainOtp);
    } catch (mailErr) {
      console.error(mailErr);
      return res.status(500).json({ message: "Could not send verification email" });
    }

    res.json({
      message: "If an account needs verification, a new code has been sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Resend error" });
  }
});

// login api/auth/login
router.post("/login", async (req, res) => {
  try {
    const password = req.body.password;
    const rawIdentifier =
      typeof req.body.identifier === "string"
        ? req.body.identifier.trim()
        : typeof req.body.email === "string"
          ? req.body.email.trim()
          : "";
    const normalizedIdentifier = rawIdentifier.toLowerCase();

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }

    const [users] = await db.execute(
      `SELECT id, name, email, password, role, email_verified
       FROM users
       WHERE LOWER(email) = ? OR LOWER(name) = ?
       LIMIT 1`,
      [normalizedIdentifier, normalizedIdentifier]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (Number(user.email_verified) !== 1) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    try {
      await ensureWalletsForUser(user.id);
    } catch (walletErr) {
      console.error(walletErr);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

module.exports = router;
