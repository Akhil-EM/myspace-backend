const {Sequelize} = require('sequelize');
const {writeLog} = require('../util/functions/write-log');
const {validationResult} = require('express-validator');
const dbConfig = require('../config/db.config');


const responseModel = require('../models/api/response.model');
const statusCodes = require('../util/status-codes');
const Op = Sequelize.Op;

const db = require("../models/db");

//models 
const Users = db.users;
const Friends = db.friends;

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
      host:dbConfig.HOST,
      dialect:"mysql",
      operatorsAliases:0,
      pool:dbConfig.pool
    });

exports.searchFriend = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let name = req.params.name;
        
        
        let users = await  Users.findAll({ // or User.findOne
            where: {
                active:true,
                user_name: {
                  [Op.like]:`%${name}%`
                }
            },
            attributes: ['user_id','user_name', 'profile_image'] // results you want returned
        })

        res.json(responseModel("success",statusCodes.OK,"users",{users:users}));
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}
  

exports.sendRequest = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let userId = req.user.userId;
        let friendId = req.body.userId;
        //find if there is already a request
        let friendship = await Friends.findOne({where: {friendOne:userId,friendTwo:friendId}});
        
      //   1 requested
      //   2 accepted
      //   3 blocked
      //   4 deleted
     
        if(friendship && friendship.requestStatusId == 1){
            return res.json(responseModel("failed",
                           statusCodes.NOT_ACCEPTABLE,
                           "request already send"))
        }

        if(friendship && friendship.requestStatusId == 2){
            return res.json(responseModel("failed",
                         statusCodes.NOT_ACCEPTABLE,
                         "request accepted"))
        }

        if(friendship && friendship.requestStatusId == 3){
            return res.json(responseModel("failed",
                         statusCodes.NOT_ACCEPTABLE,
                         "you have been blocked"))
         }

         if(friendship && friendship.requestStatusId == 4){
            return res.json(responseModel("failed",
                         statusCodes.NOT_ACCEPTABLE,
                         "your request deleted for some reason"))
         }

     
        
        await Friends.create({friendOne:userId,
                              friendTwo:friendId,
                              sendBy:userId,
                              receivedBy:friendId});
        //also a row for vise versa relation
        await Friends.create({friendOne:friendId,
                              friendTwo:userId,
                              sendBy:userId,
                              receivedBy:friendId});
        

        res.json(responseModel("success",statusCodes.SUCCESS,"friend request has successfully send"));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}

exports.sendList = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let userId = req.user.userId;
        
        let [sendList,metadata] = await sequelize.query(
                                       `SELECT users2.user_id,users2.user_name,users2.profile_image,friends.id AS friendShipId FROM friends 
                                        LEFT JOIN users AS users1 ON users1.user_id = friends.friendOne 
                                        LEFT JOIN users AS users2 ON users2.user_id = friends.friendTwo 
                                        LEFT JOIN requeststatuses ON requeststatuses.id = friends.requestStatusId 
                                        WHERE friends.sendBy = ${userId} AND friends.friendOne = ${userId} AND requeststatuses.status = 'requested'
                                        ORDER BY friends.createdAt DESC;`);

        res.json(responseModel("success",
                               statusCodes.SUCCESS,
                               "send list",{sendList}));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}

exports.requestList = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let userId = req.user.userId;
        
        let [requestList,metadata] = await sequelize.query(
                                  `SELECT users2.user_id,users2.user_name,users2.profile_image,friends.id AS friendShipId
                                   FROM friends 
                                  LEFT JOIN users AS users1 ON users1.user_id = friends.friendOne 
                                  LEFT JOIN users AS users2 ON users2.user_id = friends.friendTwo 
                                  LEFT JOIN requeststatuses ON requeststatuses.id = friends.requestStatusId 
                                  WHERE friends.receivedBy = ${userId} AND friends.friendOne = ${userId} AND requeststatuses.status = 'requested'
                                  ORDER BY friends.createdAt DESC;`);

        res.json(responseModel("success",
                               statusCodes.SUCCESS,
                               "request list",{requestList}));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}

exports.friendList = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let userId = req.user.userId;
        
        let [friendList,metadata] = await sequelize.query(
                                      `SELECT users2.user_id,users2.user_name,users2.profile_image FROM friends 
                                       LEFT JOIN users AS users1 ON users1.user_id = friends.friendOne 
                                       LEFT JOIN users AS users2 ON users2.user_id = friends.friendTwo 
                                       LEFT JOIN requeststatuses ON requeststatuses.id = friends.requestStatusId 
                                       WHERE  requeststatuses.status = 'accepted' AND friends.friendOne = ${userId}
                                       ORDER BY friends.createdAt DESC;`);
        
        res.json(responseModel("success",
                               statusCodes.SUCCESS,
                               "friend list",{friendList}));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}

exports.acceptRequest = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        let friendId = req.params.friendId;
        let userId = req.user.userId;
         //   1 requested
         //   2 accepted
         //   3 blocked
         //   4 deleted
        await Friends.update({requestStatusId:2},{where:{friendOne:userId,friendTwo:friendId}});
        await Friends.update({requestStatusId:2},{where:{friendOne:friendId,friendTwo:userId}});

        res.json(responseModel("success",
                               statusCodes.SUCCESS,
                               "request accepted"));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}


exports.deleteRequest = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        
        
        let friendId = req.params.friendId;
        let userId = req.user.userId;
         //   1 requested
         //   2 accepted
         //   3 blocked
         //   4 deleted
        await Friends.update({requestStatusId:4},{where:{friendOne:userId,friendTwo:friendId}});
        await Friends.update({requestStatusId:4},{where:{friendOne:friendId,friendTwo:userId}});
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}

exports.blockRequest = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
   
        let status = (req.body.status == "true"?3:5);     
        let friendId = req.params.friendId;
        let userId = req.user.userId;
         //   1 requested
         //   2 accepted
         //   3 blocked
         //   4 deleted
        await Friends.update({requestStatusId:status},{where:{friendOne:userId,friendTwo:friendId}});
        await Friends.update({requestStatusId:status},{where:{friendOne:friendId,friendTwo:userId}});
        res.json(responseModel("success",
                               statusCodes.SUCCESS,
                               `user is ${status==3?"blocked":"unlocked"}`));
        
  
      }catch(error){
         writeLog("app",__filename,61,error.message);
         res.status(statusCodes.INTERNAL_SERVER_ERROR)
            .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
      }
}
