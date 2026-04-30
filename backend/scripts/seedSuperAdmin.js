require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function seedSuperAdmin() {
  const name = process.env.SUPER_ADMIN_NAME || "superadmin";
  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@weeja.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "123456";

  const passwordHash = await bcrypt.hash(password, 10);

  const [existing] = await db.execute(
    "SELECT id FROM users WHERE email = ? OR (role = 'super_admin' AND name = ?) LIMIT 1",
    [email, name]
  );

  if (existing.length > 0) {
    await db.execute(
      `UPDATE users
       SET name = ?, email = ?, password = ?, role = 'super_admin', email_verified = 1
       WHERE id = ?`,
      [name, email, passwordHash, existing[0].id]
    );

    console.log(`Updated existing super admin: ${email}`);
    return;
  }

  const [result] = await db.execute(
    `INSERT INTO users (name, email, password, role, email_verified)
     VALUES (?, ?, ?, 'super_admin', 1)`,
    [name, email, passwordHash]
  );

  console.log(`Created super admin #${result.insertId}: ${email}`);
}

seedSuperAdmin()
  .catch((error) => {
    console.error("Could not seed super admin");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
