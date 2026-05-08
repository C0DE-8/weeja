const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const { advanceEndedPools } = require("./utils/poolUtils");

const PORT = process.env.PORT || 5000;
const ENDED_POOL_CHECK_INTERVAL_MS = 60 * 1000;

async function updateEndedPools() {
  try {
    await advanceEndedPools();
  } catch (err) {
    console.error("Could not advance ended pools", err);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

updateEndedPools();
setInterval(updateEndedPools, ENDED_POOL_CHECK_INTERVAL_MS).unref();
