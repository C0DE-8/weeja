require("dotenv").config();

const db = require("../config/db");
const { backfillWalletsForExistingUsers } = require("../utils/userWallets");

async function main() {
  try {
    const totalUsers = await backfillWalletsForExistingUsers();
    console.log(`Wallet backfill complete for ${totalUsers} verified users.`);
    await db.end();
  } catch (error) {
    console.error("Could not backfill user wallets");
    console.error(error);
    process.exitCode = 1;
    await db.end();
  }
}

main();
