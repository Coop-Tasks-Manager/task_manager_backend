const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* CREATE BOARD */
router.post("/:teamId", authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Board name is required" });
    }

    // Check if user belongs to the team
    const memberCheck = await pool.query(
      `SELECT * FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not a team member" });
    }

    const board = await pool.query(
      `INSERT INTO boards (team_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [teamId, name]
    );

    res.status(201).json(board.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* GET BOARDS FOR TEAM (WITH USER ROLE) */
router.get("/:teamId", authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;

    //Check membership + get role
    const memberCheck = await pool.query(
      `
      SELECT role
      FROM team_members
      WHERE team_id = $1 AND user_id = $2
      `,
      [teamId, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not a team member" });
    }

    const userRole = memberCheck.rows[0].role; // leader | member

    // Fetch boards
    const boards = await pool.query(
      `
      SELECT id, name, team_id, created_at
      FROM boards
      WHERE team_id = $1
      ORDER BY created_at
      `,
      [teamId]
    );

    // Send boards + role
    res.json({
      role: userRole,
      boards: boards.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/details/:boardId", authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
        b.id AS board_id,
        b.name AS board_name,
        t.id AS team_id,
        t.name AS team_name,
        tm.role
       FROM boards b
       JOIN teams t ON b.team_id = t.id
       JOIN team_members tm ON tm.team_id = t.id
       WHERE b.id = $1
         AND tm.user_id = $2`,
      [boardId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        message: "Access denied or board not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch board details" });
  }
});



//DELETE BOARD (LEADER ONLY)

router.delete("/:boardId", authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;

    // Get board + team info
    const boardCheck = await pool.query(
      `
      SELECT b.id, b.team_id, t.leader_id
      FROM boards b
      JOIN teams t ON b.team_id = t.id
      WHERE b.id = $1
      `,
      [boardId]
    );

    if (boardCheck.rows.length === 0) {
      return res.status(404).json({ message: "Board not found" });
    }

    const board = boardCheck.rows[0];

    //Check if requester is team leader
    if (board.leader_id !== req.userId) {
      return res.status(403).json({
        message: "Only team leader can delete this board"
      });
    }

    // Delete board (tasks will follow if FK is set)
    await pool.query(
      `DELETE FROM boards WHERE id = $1`,
      [boardId]
    );

    res.json({ message: "Board deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
