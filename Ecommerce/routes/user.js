const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getLoggedInUser,
  updatePassword,
  updateUserDetails, 
  getAllUsers,
  getAllUsersAndManager,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser
} = require("../controllers/userController");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUser);
router.route("/password/update").post(isLoggedIn, updatePassword);
router.route("/userdashboard/updateDetails").post(isLoggedIn, updateUserDetails);

//admin routes
router.route("/admin/allusers").get(isLoggedIn,customRole("admin"), getAllUsersAndManager);
router.route("/admin/user/:id")
  .get(isLoggedIn,customRole("admin"), getSingleUser)
  .put(isLoggedIn,customRole("admin"), updateSingleUser);
router.route("/admin/user/:id").delete(isLoggedIn,customRole("admin"), deleteSingleUser);
//manager routes
router.route("/manager/allusers").get(isLoggedIn,customRole("manager"), getAllUsers);

module.exports = router;
