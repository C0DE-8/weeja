const db = require("../config/db");

let poolCreationSchemaReady = false;

async function ensurePoolCreationSchema() {
  if (poolCreationSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS pool_creation_fee_settings (
      id INT NOT NULL AUTO_INCREMENT,
      currency_id INT NOT NULL,
      amount DECIMAL(24,8) NOT NULL DEFAULT 0.00000000,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_by INT DEFAULT NULL,
      updated_by INT DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_pool_creation_fee_currency (currency_id),
      KEY idx_pool_creation_fee_active (is_active),
      KEY idx_pool_creation_fee_created_by (created_by),
      KEY idx_pool_creation_fee_updated_by (updated_by),
      CONSTRAINT fk_pool_creation_fee_currency FOREIGN KEY (currency_id) REFERENCES currencies (id),
      CONSTRAINT fk_pool_creation_fee_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
      CONSTRAINT fk_pool_creation_fee_updated_by FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  const [columns] = await db.query("SHOW COLUMNS FROM pools");
  const columnMap = new Map(columns.map((column) => [column.Field, column]));
  const alterStatements = [];

  if (!columnMap.has("review_status")) {
    alterStatements.push(
      "ADD COLUMN `review_status` ENUM('approved','under_review','rejected') NOT NULL DEFAULT 'approved' AFTER `status`"
    );
    alterStatements.push("ADD KEY `idx_pools_review_status` (`review_status`)");
  }

  if (!columnMap.has("review_notes")) {
    alterStatements.push("ADD COLUMN `review_notes` VARCHAR(255) DEFAULT NULL AFTER `review_status`");
  }

  if (!columnMap.has("reviewed_by")) {
    alterStatements.push("ADD COLUMN `reviewed_by` INT DEFAULT NULL AFTER `review_notes`");
    alterStatements.push("ADD KEY `idx_pools_reviewed_by` (`reviewed_by`)");
    alterStatements.push(
      "ADD CONSTRAINT `fk_pools_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL"
    );
  }

  if (!columnMap.has("reviewed_at")) {
    alterStatements.push("ADD COLUMN `reviewed_at` DATETIME DEFAULT NULL AFTER `reviewed_by`");
  }

  if (!columnMap.has("approved_at")) {
    alterStatements.push("ADD COLUMN `approved_at` DATETIME DEFAULT NULL AFTER `reviewed_at`");
  }

  if (!columnMap.has("rejected_at")) {
    alterStatements.push("ADD COLUMN `rejected_at` DATETIME DEFAULT NULL AFTER `approved_at`");
  }

  if (!columnMap.has("creation_fee_amount")) {
    alterStatements.push(
      "ADD COLUMN `creation_fee_amount` DECIMAL(24,8) NOT NULL DEFAULT 0.00000000 AFTER `created_by`"
    );
  }

  if (!columnMap.has("creation_fee_wallet_id")) {
    alterStatements.push("ADD COLUMN `creation_fee_wallet_id` INT DEFAULT NULL AFTER `creation_fee_amount`");
    alterStatements.push("ADD KEY `idx_pools_creation_fee_wallet` (`creation_fee_wallet_id`)");
    alterStatements.push(
      "ADD CONSTRAINT `fk_pools_creation_fee_wallet` FOREIGN KEY (`creation_fee_wallet_id`) REFERENCES `user_wallets` (`id`) ON DELETE SET NULL"
    );
  }

  if (alterStatements.length > 0) {
    await db.query(`ALTER TABLE pools ${alterStatements.join(", ")}`);
  }

  await db.query(
    `INSERT INTO pool_creation_fee_settings (currency_id, amount, is_active)
     SELECT c.id, 0.00000000, 1
     FROM currencies c
     LEFT JOIN pool_creation_fee_settings settings ON settings.currency_id = c.id
     WHERE settings.id IS NULL`
  );

  poolCreationSchemaReady = true;
}

async function fetchCreationFeeSettings(connection = db) {
  await ensurePoolCreationSchema();

  const [rows] = await connection.execute(
    `SELECT
        settings.id,
        settings.currency_id,
        settings.amount,
        settings.is_active,
        c.code AS currency_code,
        c.name AS currency_name,
        c.status AS currency_status,
        settings.created_at,
        settings.updated_at
      FROM pool_creation_fee_settings settings
      INNER JOIN currencies c ON c.id = settings.currency_id
      ORDER BY c.code ASC, settings.id ASC`
  );

  return rows;
}

async function fetchCreationFeeSettingByCurrency(connection, currencyId) {
  await ensurePoolCreationSchema();

  const [rows] = await connection.execute(
    `SELECT
        settings.id,
        settings.currency_id,
        settings.amount,
        settings.is_active,
        c.code AS currency_code,
        c.name AS currency_name,
        c.status AS currency_status
      FROM pool_creation_fee_settings settings
      INNER JOIN currencies c ON c.id = settings.currency_id
      WHERE settings.currency_id = ?
      LIMIT 1`,
    [currencyId]
  );

  return rows[0] || null;
}

module.exports = {
  ensurePoolCreationSchema,
  fetchCreationFeeSettingByCurrency,
  fetchCreationFeeSettings,
};
