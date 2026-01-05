// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const authRoutes = require("./routes/auth.routes");

// const app = express();

// app.use(cors());

// app.use(express.json());

// app.use("/api/auth", authRoutes);

// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });


// const teamRoutes = require("./routes/team.routes");

// app.use("/api/teams", teamRoutes);
// const boardRoutes = require("./routes/board.routes");
// app.use("/api/boards", boardRoutes);
// const taskRoutes = require("./routes/task.routes");


// app.use("/api/teams", teamRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/boards", require("./routes/board.routes"));

// const userRoutes = require("./routes/user.routes");
// app.use("/api/users", userRoutes);


require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

//MIDDLEWARE
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://manage-tasks-t0p9.onrender.com"
  ],
  credentials: true
}));

app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth.routes");
const teamRoutes = require("./routes/team.routes");
const boardRoutes = require("./routes/board.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

//SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
