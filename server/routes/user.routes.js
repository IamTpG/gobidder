const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { isAuth, isAdmin } = require("../middlewares/auth.middleware");

router.get("/me", isAuth, userController.getMe);
router.get("/", isAdmin, userController.getUsers);
router.get("/:id", isAdmin, userController.getUserById);
router.put("/me", isAuth, userController.updateMe);

module.exports = router;
