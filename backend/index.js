require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const https = require("https");
const connection = require("./db");
const { User } = require("./models/user");
const { initSocketService } = require("./services/socketService");

// Import route controllers
const userRoutes = require("./routes/registerUsers");
const authRoutes = require("./routes/authenticate");
const verifyEmailRoutes = require("./routes/verifyEmail");
const deleteUserRoutes = require("./routes/deleteUser");
const profileRoutes = require("./routes/profileController");
const gameSessionController = require("./Controllers/gameSessionController");
const roomRoutes = require("./routes/roomRoutes");
const contentRoutes = require("./routes/ContentGeneratorRoutes");
const multiplayerRoutes = require("./routes/multiGameSessionRoutes");

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Welcome route to check server status
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    message: "Welcome to the Typing Game API",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/registerUsers", userRoutes);
app.use("/api/authenticate", authRoutes);
app.use("/api/verifyEmail", verifyEmailRoutes);
app.use("/api/deleteUser", deleteUserRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/gameSession", gameSessionController);
app.use("/api/multiplayer", multiplayerRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/content", contentRoutes);

// Clean up unverified users
setInterval(async () => {
  await User.deleteUnverifiedUsers();
}, 90 * 1000);

// Server Configuration
const PORT = process.env.PORT || 1236;
const HOST = "0.0.0.0";

// 🔒 Hardcoded SSL Paths
const privateKeyPath = "/etc/letsencrypt/live/nmt.api.shaafsalman.com/privkey.pem";
const certificatePath = "/etc/letsencrypt/live/nmt.api.shaafsalman.com/fullchain.pem";

let server;

try {
  // Check if SSL files exist & are readable
  fs.accessSync(privateKeyPath, fs.constants.R_OK);
  fs.accessSync(certificatePath, fs.constants.R_OK);

  console.log("✅ SSL certificates found! Starting HTTPS server...");
  
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");
  const certificate = fs.readFileSync(certificatePath, "utf8");
  const credentials = { key: privateKey, cert: certificate };

  server = https.createServer(credentials, app);
} catch (error) {
  console.warn("⚠️ SSL certificates NOT found or inaccessible. Starting HTTP server instead.");
  console.error("Error Details:", error.message);
  
  server = http.createServer(app);
}

// Initialize Socket.io with the server
const io = initSocketService(server);

// Start server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at ${server instanceof https.Server ? "https" : "http"}://${HOST}:${PORT}/`);
});

// Database connection
connection();
