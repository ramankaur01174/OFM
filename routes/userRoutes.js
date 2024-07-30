const express = require("express");
const userController = require("./../controller/userController");

const router = express.Router();

router.route("/checkRoles").get(userController.checkRoles);

router.post("/signup", userController.signup);
router.post("/login", userController.login);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
