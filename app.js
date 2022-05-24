require("dotenv").config();

const express = require("express");
const cors = require("cors");
const moran = require("morgan");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT;
const appName = require("./src/config/app.config").program;

//api response models
const healthResponseModel = require("./src/models/api/health-response.model");
const responseModel = require("./src/models/api/response.model");
//status codes
const statusCodes = require("./src/util/status-codes");

//configure node app
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(moran('tiny')); //logs time of request and response
app.use(express.static('public'));//share the public files

//application base
app.get("/",(req,res)=>
    res.json(responseModel("success",statusCodes.OK,"at application index")));

//application health check 
app.get("/check-health",(req,res)=>  res.json(healthResponseModel()));

//get logs
app.get("/app-log/:token",(req,res)=>{
    const logAccessToken = process.env.LOG_ACCESS_TOKEN;
    let token = req.params.token;
    if(logAccessToken !== token) return res.status(statusCodes.FORBIDDEN)
                                           .json(responseModel("failed",statusCodes.UNAUTHORIZED,"you don't have access to this resource"));

    try{
      
       res.sendFile(`${__dirname}/public/logs/app-log.txt`);

    }catch(error){
        res.status(statusCodes.internal_server_error)
           .json(responseModel("error",error.message));
    }
})

app.get("/sql-log/:token",(req,res)=>{
    const logAccessToken = process.env.LOG_ACCESS_TOKEN;
    let token = req.params.token;
    if(logAccessToken !== token) return res.status(statusCodes.FORBIDDEN)
                                           .json(responseModel("failed",statusCodes.UNAUTHORIZED,"you don't have access to this resource"));

    try{
      
       res.sendFile(`${__dirname}/public/logs/sql-log.txt`);

    }catch(error){
        res.status(statusCodes.internal_server_error)
           .json(responseModel("error",false,error.message));
    }
})


//routers
app.use("/user",require("./src/routers/user.router"));
app.use("/token",require("./src/routers/token.router"));
app.use("/post",require("./src/routers/post.router"));
app.use("/friends",require("./src/routers/friend.router"));
app.use("/messages",require("./src/routers/message.router"));

//error catching route
app.all("*",(req,res)=>
    res.status(statusCodes.NOT_FOUND)
       .json(responseModel("error",statusCodes.NOT_FOUND,"requested endpoint was not found in this server")));

app.listen(port,()=>console.log(`\n${appName} is running on ${port}`));








