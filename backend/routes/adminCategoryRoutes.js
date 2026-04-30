const express = require("express");
const db = require("../config/db");

const router = express.Router();

const CATEGORY_TYPES = new Set(["sport", "event"]);

function normalizeCategoryName(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("name is required");
  }

  return value.trim();
}

function requireCategoryType(value) {
  if (!CATEGORY_TYPES.has(value)) {
    throw new Error("type must be either sport or event");
  }

  return value;
}

function normalizeActiveFlag(value) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  if (value === 1 || value === 0 || value === "1" || value === "0") {
    return Number(value);
  }

  throw new Error("is_active must be a boolean");
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, type, is_active, created_at, updated_at
       FROM categories
       ORDER BY type ASC, name ASC`
    );

    res.json({ categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not load admin categories" });
  }
});

router.post("/", async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body.name);
    const type = requireCategoryType(req.body.type);
    const isActive = normalizeActiveFlag(req.body.is_active) ?? 1;

    const [result] = await db.execute(
      `INSERT INTO categories (name, type, is_active)
       VALUES (?, ?, ?)`,
      [name, type, isActive]
    );

    const [rows] = await db.execute(
      `SELECT id, name, type, is_active, created_at, updated_at
       FROM categories
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Category created",
      category: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not create category" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const fields = [];
    const values = [];

    if (req.body.name !== undefined) {
      fields.push("name = ?");
      values.push(normalizeCategoryName(req.body.name));
    }

    if (req.body.type !== undefined) {
      fields.push("type = ?");
      values.push(requireCategoryType(req.body.type));
    }

    if (req.body.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(normalizeActiveFlag(req.body.is_active));
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const [result] = await db.execute(
      `UPDATE categories
       SET ${fields.join(", ")}
       WHERE id = ?`,
      [...values, categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    const [rows] = await db.execute(
      `SELECT id, name, type, is_active, created_at, updated_at
       FROM categories
       WHERE id = ?`,
      [categoryId]
    );

    res.json({
      message: "Category updated",
      category: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not update category" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const [poolRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM pools WHERE category_id = ?",
      [categoryId]
    );

    if (Number(poolRows[0].total) > 0) {
      const [result] = await db.execute(
        `UPDATE categories
         SET is_active = 0
         WHERE id = ?`,
        [categoryId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.json({
        message: "Category is in use and has been deactivated instead of deleted",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM categories WHERE id = ?",
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Could not delete category" });
  }
});

router.post("/:id/deactivate", async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const [result] = await db.execute(
      `UPDATE categories
       SET is_active = 0
       WHERE id = ?`,
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deactivated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not deactivate category" });
  }
});

module.exports = router;
