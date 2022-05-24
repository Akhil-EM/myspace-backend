const fs = require("fs");
const {Sequelize} = require("sequelize");
const {writeLog} = require("../util/functions/write-log");
const {  validationResult } = require('express-validator');
const dbConfig = require("../config/db.config");

//json response format and status codes like 200
const responseModel = require("../models/api/response.model")
const statusCodes = require("../util/status-codes");

const sequelize = new Sequelize(
                      dbConfig.DB,
                      dbConfig.USER,
                      dbConfig.PASSWORD,{
                        host:dbConfig.HOST,
                        dialect:"mysql",
                        operatorsAliases:0,
                        pool:dbConfig.pool
                      });

const db = require("../models/db");

//models
const Posts = db.posts;
const User = db.users;

exports.addPost = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      
      let title = req.body.title;
      let content =  req.body.content;
      let hasImage = req.body.hasImage;
      
      let pathToFile = req.file.path;
      if(!hasImage){
        //delete default added image
        fs.unlink(pathToFile, function(err) {
          if(err){
            writeLog("app",__filename,141,error.message);
          }
      }) 
      }

      let userId = req.user.userId;
      let image = hasImage?null:req.file.filename;
      console.log({title,content,image,userId});
      await Posts.create({title,content,image,userId});
      
      res.json(responseModel("success",statusCodes.OK,"new post added"));

    }catch(error){
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

exports.fetchPosts = async (req,res) =>{
  try{
      
    let [posts, metadata] = await sequelize.query(
                               `SELECT post_id,title,content,image,userId,user_name FROM posts 
                                JOIN users ON posts.userId = users.user_id
                                WHERE posts.archived = 0
                                ORDER BY posts.createdAt DESC`);
    
       
    res.json(responseModel("success",statusCodes.OK,"available posts",{posts}));

  }catch(error){
     console.log(error);
     writeLog("app",__filename,61,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}

exports.fetchMyPosts = async (req,res) =>{
  try{
     
    let userId = req.user.userId;
    let [posts, metadata] = await sequelize.query(
                               `SELECT archived,post_id,title,content,image,userId,user_name FROM posts 
                                JOIN users ON posts.userId = users.user_id
                                WHERE  posts.userId = ${userId}
                                ORDER BY posts.createdAt DESC`);
    
       
    res.json(responseModel("success",statusCodes.OK,"available posts",{posts}));

  }catch(error){
     console.log(error);
     writeLog("app",__filename,61,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}

exports.updatePost = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      
      let post_id = req.params.postId;
      let title = req.body.title;
      let content =  req.body.content;
      let hasImage = req.body.hasImage;
      
      let pathToFile = req.file.path;
      if(!hasImage){
        //delete default added image
        fs.unlink(pathToFile, function(err) {
          if(err){
            writeLog("app",__filename,141,error.message);
          }
      }) 
      }

      
      
      let post = await Posts.findOne({where:{post_id}});
      let image = hasImage?post.image:req.file.filename;
      
      await Posts.update({title,content,image},{where:{post_id}});
      
      res.json(responseModel("success",statusCodes.OK,"post updated successfully"));

    }catch(error){
       console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}


exports.archivePost = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      let post_id = req.params.postId;

      let post = await Posts.findOne({where:{post_id}});
      let oldStatus = post.archived;
      let archived = oldStatus?false:true;

      await Posts.update({archived},{where:{post_id}});
      
      let message = archived?"archived":"un archived";
      res.json(responseModel("success",statusCodes.OK,"your post has successfully "+message));

    }catch(error){
       console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

exports.deletePost = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      let post_id = req.params.postId;

      Posts.destroy({where:{post_id}});
      
      res.json(responseModel("success",statusCodes.OK,"this post has successfully deleted"));

    }catch(error){
       console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

