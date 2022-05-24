const express = require("express");
const fs = require("fs");
const {body,query,param} =require("express-validator");
const {authenticateUser} = require("../middleware/authentication.middleware");
const router = express.Router();

const messageController = require("../controller/message.controller");


router.post("/:receiverId",
                authenticateUser,
                [body("message", "required").trim().not().isEmpty()],
                messageController.sendMessage);

router.get("/:receiverId/send-list",
                authenticateUser,
                messageController.sendList);

router.get("/:senderId/received-list",
                authenticateUser,
                messageController.receivedList);

router.put("/:messageId/delete",
                authenticateUser,
                messageController.deleteMessage);

module.exports = router;

