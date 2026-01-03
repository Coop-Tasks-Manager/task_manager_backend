const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/* CREATE TASK */

router.post("/:boardId", authMiddleware, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description, priority, due_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Check if user belongs to the team owning the board
    const boardCheck = await pool.query(
      `
      SELECT 1
      FROM boards b
      JOIN team_members tm ON tm.team_id = b.team_id
      WHERE b.id = $1 AND tm.user_id = $2
      `,
      [boardId, req.userId]
    );

    if (boardCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = await pool.query(
      `
      INSERT INTO tasks
      (board_id, title, description, priority, due_date, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [boardId, title, description, priority, due_date, req.userId]
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

    // Access check
    const accessCheck = await pool.query(
      `
      SELECT 1
      FROM boards b
      JOIN team_members tm ON tm.team_id = b.team_id
      WHERE b.id = $1 AND tm.user_id = $2
      `,
      [boardId, req.userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tasks = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', u.id,
              'name', u.name
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) AS assignees
      FROM tasks t
      LEFT JOIN task_assignments ta ON ta.task_id = t.id
      LEFT JOIN users u ON u.id = ta.user_id
      WHERE t.board_id = $1
      GROUP BY t.id
      ORDER BY t.created_at
      `,
      [boardId]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


/*  UPDATE TASK (status, assignment, etc.)*/

router.put("/:taskId/v", authMiddleware, async (req, res) => {
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
/* DELETE TASK – LEADER ONLY */
router.delete("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.userId;

    /* Find task + team */
    const taskRes = await pool.query(
      `SELECT t.id, b.team_id
       FROM tasks t
       JOIN boards b ON t.board_id = b.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (taskRes.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const teamId = taskRes.rows[0].team_id;

    /* Check if user is leader */
    const leaderCheck = await pool.query(
      `SELECT 1 FROM team_members
       WHERE team_id = $1 AND user_id = $2 AND role = 'leader'`,
      [teamId, userId]
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Only team leader can delete tasks"
      });
    }

    /*delete task */
    await pool.query(
      `DELETE FROM tasks WHERE id = $1`,
      [taskId]
    );

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

 /* Get all tasks assigned to the logged-in user
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

/* ASSIGN USERS TO TASK */
router.post("/:taskId/assignees", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds array required" });
    }

    // Permission: creator OR leader
    const permissionCheck = await pool.query(
      `
      SELECT 
        t.created_by,
        tm.role
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN team_members tm 
        ON tm.team_id = b.team_id AND tm.user_id = $2
      WHERE t.id = $1
      `,
      [taskId, req.userId]
    );

    if (permissionCheck.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { created_by, role } = permissionCheck.rows[0];

    if (created_by !== req.userId && role !== "leader") {
      return res.status(403).json({ message: "Not authorized" });
    }

    for (const userId of userIds) {
      await pool.query(
        `
        INSERT INTO task_assignments (task_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [taskId, userId]
      );
    }

    res.json({ message: "Users assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    // 1️⃣ Permission check
    const check = await pool.query(
      `
      SELECT 
        t.created_by,
        tm.role AS team_role,
        EXISTS (
          SELECT 1 FROM task_assignments ta
          WHERE ta.task_id = t.id AND ta.user_id = $2
        ) AS is_assigned
      FROM tasks t
      JOIN boards b ON b.id = t.board_id
      JOIN team_members tm 
        ON tm.team_id = b.team_id AND tm.user_id = $2
      WHERE t.id = $1
      `,
      [taskId, req.userId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { created_by, team_role, is_assigned } = check.rows[0];

    const canEdit =
      created_by === req.userId ||
      team_role === "leader" ||
      is_assigned;

    if (!canEdit) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 2️⃣ UPDATE (now includes title & description)
    const updated = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date)
      WHERE id = $6
      RETURNING *
      `,
      [title, description, status, priority, due_date, taskId]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("UPDATE TASK ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
