const md5 = require("md5");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {writeLog} = require("../util/functions/write-log");
const {  validationResult } = require('express-validator');
const sendMail = require("../util/functions/send-mail");

//json response format and status codes like 200
const responseModel = require("../models/api/response.model")
const statusCodes = require("../util/status-codes");

const db = require("../models/db/")
//models
const Users = db.users;
const Otps = db.otps;
const Tokens = db.tokens;

exports.addUser = async (req,res) =>{
     //check for validation errors 
     const errors = validationResult(req);
     if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                           statusCodes.NOT_ACCEPTABLE,
                                                           "validation errors",
                                                           {errors: errors.array()}))

    try{
      
      let email = req.body.email;
      let password = req.body.password;

      let emailCheck  = await Users.findOne({where:{email}});
      if(emailCheck) return res.json(responseModel("failed",statusCodes.NOT_ACCEPTABLE,"this email is already registered with us"));

      //register new user
      let user = await  Users.create({
               email,
               password:md5(password)});

      let userId = user.dataValues.user_id;
      let otp = Math.floor(100000 + Math.random() * 900000);

      //save otp
       await Otps.create({otp});
       //generate jwt token & save
       let payLoad ={userId};
       let token = generateToken(payLoad,process.env.TOKEN_SECRET);

       await Tokens.create({token,type:"VERIFICATION",user_id:userId});

      await sendMail(email,"Welcome to My space",
                     `Hai there,\n your OTP to verify email address is <b>${otp}</b>`)
      
      
      res.json(responseModel("success",
                             statusCodes.OK,
                             "new user registered,check your email for verification",
                              {token}));

    }catch(error){
       writeLog("app",__filename,61,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

exports.fetchUsers = async (req,res) =>{
  //check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}))

 try{
   
    if(req.user.userType != "ADMIN") return res.json(responseModel("failed",
                                                                   statusCodes.UNAUTHORIZED,
                                                                   "you do not have access to this resource."));

                                                  
   
    let users = await  Users.findAll({where:{type:"USER"}});

    res.json(responseModel("success",
                           statusCodes.SUCCESS,
                           "users",
                           {users}))

 }catch(error){
    writeLog("app",__filename,61,error.message);
    res.status(statusCodes.INTERNAL_SERVER_ERROR)
       .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
 }
}

exports.activateDeactivateUser = async (req,res) =>{
  //check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}))

 try{
   
    if(req.user.userType != "ADMIN") return res.json(responseModel("failed",
                                                                   statusCodes.UNAUTHORIZED,
                                                                   "you do not have access to this resource."));

                                                  
    let user_id = req.params.userId;
    let user = await Users.findOne({where: {user_id}}) ;
    let status = user.active ? false : true;

    
    await Users.update({active:status},{where:{user_id}});
    let message = status ? "activated":"deactivated";
    res.json(responseModel("success",
                           statusCodes.SUCCESS,
                           "user is "+message));

 }catch(error){
    writeLog("app",__filename,61,error.message);
    res.status(statusCodes.INTERNAL_SERVER_ERROR)
       .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
 }
}


exports.verifyOTP = async (req,res) =>{
     //check for validation errors 
     const errors = validationResult(req);
     if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                           statusCodes.NOT_ACCEPTABLE,
                                                           "validation errors",
                                                           {errors: errors.array()}))

    try{
      
      let otp = req.params.otp;
      let type = req.query.type;
      //find token
      let result = await Otps.findOne({where:{otp,type}});
      
      
      if(!result) return res.json(responseModel("failed",statusCodes.NOT_FOUND,"invalid OTP provided"));
      let otpId = result.otp_id;
      let userId = req.user.userId;
      //update in otp table and user
      await Otps.update({verified:true,verified_date:new Date()},{where:{otp_id:otpId}});
      await Users.update({email_verified:true,active:true},{where:{user_id:userId}});//user id getting from middleware

      //delete old token 
      await Tokens.destroy({where:{token:req.token}});

      //generate new token and send back to user
      let payLoad ={userId};
      let token = generateToken(payLoad,process.env.TOKEN_SECRET);

       if(type == "PASSWORD_RESET"){
         await Tokens.create({token,type:"PASSWORD_RESET",user_id:userId})
       }else{
         await Tokens.create({token,type:"ACCOUNT_SETUP",user_id:userId})
       }

      res.json(responseModel("success",statusCodes.OK,"OTP verified successfully",{token}));

    }catch(error){
       console.log(error);
       writeLog("app",__filename,104,error.message);
       res.status(statusCodes.INTERNAL_SERVER_ERROR)
          .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
    }
}

exports.usernameCheck = async (req,res) =>{


  try{
    
    let username = req.params.username;
    
    //find token
    let result = await Users.findOne({where:{user_name:username}});
    
    if(!result)return res.json(responseModel())
    

    res.json(responseModel("failed",statusCodes.NOT_ACCEPTABLE,"this username is already taken"));

  }catch(error){
     writeLog("app",__filename,126,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}

exports.setupProfile = async (req,res) =>{
   //check for validation errors 
   const errors = validationResult(req);
   let pathToFile;
    if(req.file)  pathToFile = "./"+req.file.path;
    if (!errors.isEmpty()) {
        //form has error so delete uploaded image
      if(req.file){
        fs.unlink(pathToFile, function(err) {
            if(err){
              writeLog("app",__filename,141,error.message);
            }
        }) 
      }

      if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                              statusCodes.NOT_ACCEPTABLE,
                                                              "validation errors",
                                                              {errors: errors.array()}))
    }

    let userId = req.user.userId;
    let profile = await Users.findOne({where:{user_id:userId}});
    
    if(profile.profile_image){
      //already has profile image
      //upload deleted one 
      fs.unlink(pathToFile, function(err) {
        if(err){
          writeLog("app",__filename,141,error.message);
        }
      }) 
    }

    let user_name = req.body.username;
    let profile_image = req.file?req.file.filename:profile.profile_image;

    await Users.update({user_name,profile_image},{where:{user_id:userId}});
    //delete old token 
    await Tokens.destroy({where:{token:req.token}});

    //generate new token and send back to user
    let payLoad ={userId};
    let token = generateToken(payLoad,process.env.TOKEN_SECRET);

    await Tokens.create({token,type:"AUTHENTICATION",user_id:userId})

    res.json(responseModel("success",statusCodes.OK,"profile setup completed",{token}))

  try{
     
  }catch(error){
    console.log(error);
     writeLog("app",__filename,157,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}

exports.login = async (req,res) =>{
  //check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}))

  try{
    
    let email = req.body.email;
    let password = req.body.password;
    
    //check for email in DB
    let emailResult = await Users.findOne({where:{email}});
    if(!emailResult)return res.json(responseModel("failed",
                                            statusCodes.NOT_FOUND,
                                            "this email not registered with us."));

    if(md5(password) != emailResult.password) return res.json(responseModel("failed",
                                                                            statusCodes.NOT_ACCEPTABLE,
                                                                            "invalid password provided"));
    let userId = emailResult.user_id;
    let userType = emailResult.type;
    //generate new token and send back to user
    let payLoad ={userId,userType};
    let token = generateToken(payLoad,process.env.TOKEN_SECRET);

    await Tokens.create({token,type:"AUTHENTICATION",user_id:userId})

    res.json(responseModel("success",statusCodes.OK,"login success",{token,userType:emailResult.type}));

  }catch(error){
     writeLog("app",__filename,126,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}

exports.fetchProfile = async (req,res) =>{
  //check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}))

  try{
    let user_id = req.user.userId;
    Users.findOne(user_id);
      // let user = await Users.findOne()

  }catch(error){
     writeLog("app",__filename,126,error.message);
     res.status(statusCodes.INTERNAL_SERVER_ERROR)
        .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
  }
}


exports.forgotPassword = async (req,res)=>{
  
   try{
     
     let email = req.params.email;
     let password = req.body.password;
     
     //check for email in DB
     let emailResult = await Users.findOne({where:{email}});
     if(!emailResult)return res.json(responseModel("failed",
                                             statusCodes.NOT_FOUND,
                                             "this email not registered with us."));
 
     //generate password rest OTP
     let otp = Math.floor(100000 + Math.random() * 900000);

     //save otp
      await Otps.create({otp,type:"PASSWORD_RESET"});
      //generate jwt token & save

      let userId = emailResult.user_id;
      let payLoad ={userId};
      let token = generateToken(payLoad,process.env.TOKEN_SECRET);

      await Tokens.create({token,type:"PASSWORD_RESET",user_id:userId});

     await sendMail(email,"Reset My space password",
                    `Hai there,\n your OTP to reset password  is <b>${otp}</b>`)
     
     
     res.json(responseModel("success",
                            statusCodes.OK,
                            "check your email for password rest OTP",
                             {token}));
 
   }catch(error){
      writeLog("app",__filename,126,error.message);
      res.status(statusCodes.INTERNAL_SERVER_ERROR)
         .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
   }

}

exports.resetPassword = async (req,res) =>{
  //check for validation errors 
    //check for validation errors 
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.json(responseModel("failed",
                                                        statusCodes.NOT_ACCEPTABLE,
                                                        "validation errors",
                                                        {errors: errors.array()}))

   let userId = req.user.userId;
   let password = req.body.password;

   await Users.update({password:md5(password)},{where:{user_id:userId}});
   
   res.json(responseModel("success",statusCodes.OK,"password successfully rested"))

 try{
    
 }catch(error){
   console.log(error);
    writeLog("app",__filename,157,error.message);
    res.status(statusCodes.INTERNAL_SERVER_ERROR)
       .json(responseModel("error",statusCodes.INTERNAL_SERVER_ERROR,error.message))
 }

}





function generateToken(_user,_envSecret,_time){
    if(_time) return jwt.sign(_user,_envSecret,{expiresIn:_time})
    return jwt.sign(_user,_envSecret)
}