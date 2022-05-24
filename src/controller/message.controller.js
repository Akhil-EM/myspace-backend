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
const Message = db.messages;

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
      host:dbConfig.HOST,
      dialect:"mysql",
      operatorsAliases:0,
      pool:dbConfig.pool
    });

exports.sendMessage = async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                          statusCodes.NOT_ACCEPTABLE,
                                                          "validation errors",
                                                          {errors: errors.array()}));
  
      try{
        let senderId = req.user.userId;
        let receiverId = req.params.receiverId;
        let message = req.body.message;

        await Message.create({
              senderId,
              receiverId,
              message});

        res.json(responseModel());
  
      }catch(error){
        console.log(error);
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
      let senderId = req.user.userId;
      let receiverId = req.params.receiverId;
      


      let messages = await Message.findAll({where:{senderId,receiverId,deleted:false},
                                            order: [['createdAt', 'DESC']],
                                            attributes: ["id",'message','createdAt']})
      

      res.json(responseModel("success",
                             statusCodes.SUCCESS,
                             "your messages",{messages}));

    }catch(error){
      console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

exports.receivedList = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      let userId = req.user.userId;
      let senderId = req.params.senderId;
      senderId = parseInt(senderId);
      
      

      let messages = await Message.findAll({where:{senderId:senderId,receiverId:userId,deleted:false},
                                            order: [['createdAt', 'DESC']],
                                            attributes: ["id",'message','createdAt']})
      

      res.json(responseModel("success",
                             statusCodes.SUCCESS,
                             "your messages",{messages}));

    }catch(error){
      console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}
  
exports.deleteMessage = async (req,res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}));

    try{
      
      let id = req.params.messageId;
      


      await Message.update({deleted:true},{where:{id}});
      
      res.json(responseModel());

    }catch(error){
      console.log(error);
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}