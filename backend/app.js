const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const poolRoutes = require("./routes/poolRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const voteRoutes = require("./routes/voteRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const adminPoolRoutes = require("./routes/adminPoolRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const { authenticateToken } = require("./middleware/authMiddleware");
const { authorizeRoles } = require("./middleware/roleMiddleware");

const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pools", poolRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use(
  "/api/admin/categories",
  authenticateToken,
  authorizeRoles("admin", "super_admin"),
  adminCategoryRoutes
);
app.use(
  "/api/admin/pools",
  authenticateToken,
  authorizeRoles("admin", "super_admin"),
  adminPoolRoutes
);
app.use("/api/super-admin", superAdminRoutes);

module.exports = app;
