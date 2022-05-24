const express = require("express");
const fs = require("fs");
const {body,query,param} =require("express-validator");
const {authenticateUser} = require("../middleware/authentication.middleware");
const router = express.Router();

const friendController = require("../controller/friend.controller");


router.get("/:name/search",
                authenticateUser,
                friendController.searchFriend);

router.post("/send-request",
                authenticateUser,
                friendController.sendRequest);

router.get("/send-list",
                authenticateUser,
                friendController.sendList);

router.get("/request-list",
                authenticateUser,
                friendController.requestList);

router.get("/",
        authenticateUser,
        friendController.friendList);

router.put("/:friendId/accept",
            authenticateUser,
            friendController.acceptRequest);


router.put("/:friendId/block",
            authenticateUser,
            friendController.blockRequest);

router.put("/:friendId/delete",
            authenticateUser,
            friendController.deleteRequest);            

module.exports = router;

