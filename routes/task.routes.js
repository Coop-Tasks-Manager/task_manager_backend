const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* CREATE TASK */

router.post("/:boardId", authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, due_date, assigned_to } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Check if user belongs to the team owning the board
    const boardCheck = await pool.query(
      `SELECT tm.user_id
       FROM boards b
       JOIN team_members tm ON b.team_id = tm.team_id
       WHERE b.id = $1 AND tm.user_id = $2`,
      [boardId, req.userId]
    );

    if (boardCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = await pool.query(
      `INSERT INTO tasks
       (board_id, title, description, priority, due_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [boardId, title, description, priority, due_date, assigned_to]
    );

    res.status(201).json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* TASKS FOR BOARD */
router.get("/:boardId", authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;

    const accessCheck = await pool.query(
      `SELECT tm.user_id
       FROM boards b
       JOIN team_members tm ON b.team_id = tm.team_id
       WHERE b.id = $1 AND tm.user_id = $2`,
      [boardId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await pool.query(
      `SELECT * FROM tasks WHERE board_id = $1 ORDER BY created_at`,
      [boardId]
    );

    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*  UPDATE TASK (status, assignment, etc.)*/

router.put("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, priority, assigned_to, due_date } = req.body;

    const accessCheck = await pool.query(
      `SELECT tm.user_id
       FROM tasks t
       JOIN boards b ON t.board_id = b.id
       JOIN team_members tm ON b.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [taskId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedTask = await pool.query(
      `UPDATE tasks
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           due_date = COALESCE($4, due_date)
       WHERE id = $5
       RETURNING *`,
      [status, priority, assigned_to, due_date, taskId]
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DELETE TASK */

router.delete("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;

    const accessCheck = await pool.query(
      `SELECT tm.user_id
       FROM tasks t
       JOIN boards b ON t.board_id = b.id
       JOIN team_members tm ON b.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [taskId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    await pool.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET /api/tasks/my
 * Get all tasks assigned to the logged-in user
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await req.db.query(
      `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        b.name AS board_name,
        tm.name AS team_name
      FROM tasks t
      JOIN boards b ON t.board_id = b.id
      JOIN teams tm ON b.team_id = tm.id
      WHERE t.assigned_to = $1
      ORDER BY t.due_date ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});


module.exports = router;
