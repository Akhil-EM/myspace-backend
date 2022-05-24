const express = require("express");
const multer =require('multer');
const fs = require("fs");
const crypto = require("crypto");
const {body,query,param} =require("express-validator");
const {authenticateUser} = require("../middleware/authentication.middleware");
const router = express.Router();

const postController = require("../controller/post.controller");


//storage path
const fileStorageEngine = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./public/resources/images/post/')
    },
    filename:(req,file,cb)=>{
        let hash = crypto.randomBytes(8).toString("hex")
        cb(null,`${hash}-${file.originalname}`);
        req.file = undefined || file;
    }
});
const upload = multer({storage:fileStorageEngine});


router.post("/",
                authenticateUser,
                upload.single('image'),
                [body("title", "required").trim().not().isEmpty(),
                 body("content", "required").trim().not().isEmpty(),
                 body("hasImage", "required").trim().not().isEmpty()],
                postController.addPost);

router.get("/",
               authenticateUser,
               postController.fetchPosts);

router.get("/my-posts",
               authenticateUser,
               postController.fetchMyPosts);

router.put("/:postId",
               authenticateUser,
               upload.single('image'),
               [body("title", "required").trim().not().isEmpty(),
                body("content", "required").trim().not().isEmpty(),
                body("hasImage", "required").trim().not().isEmpty()],
                postController.updatePost);

router.put("/archive/:postId",
                authenticateUser,
                postController.archivePost);

router.delete("/:postId",
                authenticateUser,
                postController.deletePost);


module.exports = router;

