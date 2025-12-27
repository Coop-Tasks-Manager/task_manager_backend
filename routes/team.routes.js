const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* CREATE TEAM REQUEST */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    // Create team
    const teamResult = await pool.query(
      `INSERT INTO teams (name, leader_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, req.userId]
    );

    const team = teamResult.rows[0];

    // Add creator as team member
    await pool.query(
      `INSERT INTO team_members (user_id, team_id, role)
       VALUES ($1, $2, 'leader')`,
      [req.userId, team.id]
    );

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET MY TEAMS REQUEST */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const teams = await pool.query(
      `SELECT t.*
       FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1`,
      [req.userId]
    );

    res.json(teams.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ADD MEMBER TO TEAM REQUEST */
router.post("/:teamId/members", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const { teamId } = req.params;

    // Check if requester is manager
    const managerCheck = await pool.query(
      `SELECT * FROM teams
       WHERE id = $1 AND leader_id = $2`,
      [teamId, req.userId]
    );

    if (managerCheck.rows.length === 0) {
      return res.status(403).json({ message: "Only leader can add members" });
    }

    await pool.query(
      `INSERT INTO team_members (user_id, team_id)
       VALUES ($1, $2)`,
      [userId, teamId]
    );

    res.json({ message: "Member added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
