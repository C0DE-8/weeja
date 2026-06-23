const { connectProject } = require("diamond-sql");

const db = connectProject(process.env.SITE_ID, {
  apiKey: process.env.API_KEY,
  dbmsUrl: process.env.DBMS_URL,
});

module.exports = db;
