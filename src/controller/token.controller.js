const md5 = require("md5");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {writeLog} = require("../util/functions/write-log");
const {  validationResult } = require('express-validator');

//json response format and status codes like 200
const responseModel = require("../models/api/response.model")
const statusCodes = require("../util/status-codes");

const db = require("../models/db");
//models
const Tokens = db.tokens;

exports.logoutUser = async (req,res) =>{
     //check for validation errors 
     const errors = validationResult(req);
     if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                           statusCodes.NOT_ACCEPTABLE,
                                                           "validation errors",
                                                           {errors: errors.array()}))

    try{
      
      await Tokens.destroy({where:{token:req.token}});
      res.json(responseModel("success",
                             statusCodes.OK,
                             "user successfully logged out"));


    }catch(error){
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}
