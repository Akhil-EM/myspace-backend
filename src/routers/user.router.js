const express = require("express");
const multer =require('multer');
const fs = require("fs");
const crypto = require("crypto");
const {body,query,param} =require("express-validator");
const {authenticateUser} = require("../middleware/authentication.middleware");
const router = express.Router();

const userController = require("../controller/user.controller");


//storage path
const fileStorageEngine = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/resources/images/profile/')
    },
    filename:(req,file,cb)=>{
        let hash = crypto.randomBytes(8).toString("hex")
        cb(null,`${hash}-${file.originalname}`);
        req.file = undefined || file;
    }
});
const upload = multer({storage:fileStorageEngine});


router.post("/",userController.addUser);

router.get("/users",authenticateUser,userController.fetchUsers);
router.put("/users/:userId/modify",authenticateUser,userController.activateDeactivateUser);

router.get("/verify-otp/:otp",
           authenticateUser,
           [query("type", "not a valid otp type").trim().isIn(["VERIFICATION","PASSWORD_RESET"])],
           userController.verifyOTP);
router.get("/username-check/:username",authenticateUser,userController.usernameCheck);
router.put("/profile",
                authenticateUser,
                upload.single('image'),
                [body("username", "required").trim().not().isEmpty()],
                userController.setupProfile);

router.post("/login",
              [body("email", "required").trim().not().isEmpty(),
              body("password", "required").trim().not().isEmpty()],
              userController.login);

router.get("/",authenticateUser,
              userController.fetchProfile);

router.get("/forgot-password/:email",userController.forgotPassword);


router.put("/reset-password",
                authenticateUser,
                [body("password", "required").trim().not().isEmpty()],
                userController.resetPassword);




module.exports = router;

