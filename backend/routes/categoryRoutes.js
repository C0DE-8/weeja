const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, type, is_active, created_at, updated_at
       FROM categories
       WHERE is_active = 1
       ORDER BY type ASC, name ASC`
    );

    res.json({
      categories: rows,
      grouped: {
        sport: rows.filter((category) => category.type === "sport"),
        event: rows.filter((category) => category.type === "event"),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load categories" });
  }
});

module.exports = router;
