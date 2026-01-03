const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");
const bcrypt = require("bcrypt");

/* GET LOGGED-IN USER */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
      `,
      [req.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* UPDATE LOGGED-IN USER */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, password_hash } = req.body;

    if (!name && !email && !password_hash) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    let hashedPassword = null;
    if (password_hash) {
      hashedPassword = await bcrypt.hash(password_hash, 10);
    }

    const updatedUser = await pool.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password_hash = COALESCE($3, password_hash)
      WHERE id = $4
      RETURNING id, name, email, created_at
      `,
      [name, email, hashedPassword, req.userId]
    );

    res.json(updatedUser.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
