const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const adminPoolRoutes = require("./adminPoolRoutes");

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles("admin", "super_admin"));

router.get("/", (req, res) => {
  res.json({ message: "Admin route working" });
});

router.use("/pools", adminPoolRoutes);

module.exports = router;
