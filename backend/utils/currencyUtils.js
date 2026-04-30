const db = require("../config/db");

let currencyDecimalSchemaReady = false;

async function ensureCurrencyDecimalPlacesSchema() {
  if (currencyDecimalSchemaReady) {
    return;
  }

  const [columns] = await db.query("SHOW COLUMNS FROM currencies");
  const hasDecimalPlaces = columns.some((column) => column.Field === "decimal_places");

  if (!hasDecimalPlaces) {
    await db.query(
      "ALTER TABLE currencies ADD COLUMN `decimal_places` TINYINT(3) UNSIGNED NOT NULL DEFAULT 2 AFTER `name`"
    );
    await db.query(`
      UPDATE currencies
      SET decimal_places = CASE
        WHEN code IN ('USD', 'NGN') THEN 2
        WHEN code = 'CRYPTO' THEN 8
        ELSE 2
      END
    `);
  }

  currencyDecimalSchemaReady = true;
}

module.exports = {
  ensureCurrencyDecimalPlacesSchema,
};
