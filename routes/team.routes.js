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

/* ADD MEMBER TO TEAM (BY EMAIL) */
router.post("/:teamId/members", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const { teamId } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    /* Check if requester is team leader */
    const leaderCheck = await pool.query(
      `SELECT 1 FROM teams
       WHERE id = $1 AND leader_id = $2`,
      [teamId, req.userId]
    );

    if (leaderCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Only team leader can add members"
      });
    }

    /* Check if email exists in users table */
    const userRes = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        message: "User with this email does not exist"
      });
    }

    const userId = userRes.rows[0].id;

    /* 3️⃣ Check if user already belongs to team */
    const existsCheck = await pool.query(
      `SELECT 1 FROM team_members
       WHERE user_id = $1 AND team_id = $2`,
      [userId, teamId]
    );

    if (existsCheck.rows.length > 0) {
      return res.status(409).json({
        message: "User is already a team member"
      });
    }

    /* Insert member */
    await pool.query(
      `INSERT INTO team_members (user_id, team_id, role)
       VALUES ($1, $2, 'member')`,
      [userId, teamId]
    );

    res.status(201).json({
      message: "Member added successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add member" });
  }
});

/* GET ALL MEMBERS IN A TEAM */
router.get("/:teamId/members", authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.userId;

    /* 1️⃣ Check if requester belongs to the team */
    const accessCheck = await pool.query(
      `SELECT role FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    /* Fetch team members */
    const membersRes = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY tm.role DESC, u.name`,
      [teamId]
    );

    res.json(membersRes.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});


// router.get("/:teamId/tasks", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { teamId } = req.params;

//     // Check membership + role
//     const membership = await req.db.query(
//       `
//       SELECT role
//       FROM team_members
//       WHERE team_id = $1 AND user_id = $2
//       `,
//       [teamId, userId]
//     );

//     if (membership.rows.length === 0) {
//       return res.status(403).json({ error: "Not a member of this team" });
//     }

//     const role = membership.rows[0].role;

//     // Leader → all team tasks
//     if (role === "leader") {
//       const result = await req.db.query(
//         `
//         SELECT
//           t.id,
//           t.title,
//           t.status,
//           t.priority,
//           t.due_date,
//           u.name AS assigned_to,
//           b.name AS board_name
//         FROM tasks t
//         JOIN users u ON t.assigned_to = u.id
//         JOIN boards b ON t.board_id = b.id
//         WHERE b.team_id = $1
//         ORDER BY t.due_date ASC
//         `,
//         [teamId]
//       );

//       return res.json({ role, tasks: result.rows });
//     }

//     // 3 Member → only own tasks
//     const result = await req.db.query(
//       `
//       SELECT
//         t.id,
//         t.title,
//         t.status,
//         t.priority,
//         t.due_date,
//         b.name AS board_name
//       FROM tasks t
//       JOIN boards b ON t.board_id = b.id
//       WHERE b.team_id = $1
//         AND t.assigned_to = $2
//       ORDER BY t.due_date ASC
//       `,
//       [teamId, userId]
//     );

//     res.json({ role, tasks: result.rows });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

module.exports = router;
