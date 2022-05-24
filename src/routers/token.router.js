const express = require("express");
const {authenticateUser} = require("../middleware/authentication.middleware");
const router = express.Router();

const tokenController = require("../controller/token.controller");



router.delete("/",authenticateUser,tokenController.logoutUser);






module.exports = router;

