require('dotenv').config();
const jwt = require('jsonwebtoken');
 
const statusCodes = require("../util/status-codes");
const responseModel = require("../models/api/response.model");

const db = require("../models/db")
const Tokens = db.tokens;

async function authenticateUser(req,res,next){
    //getting token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]; //either undefined or the token
    if(token == null){
       return res.json(responseModel("failed",statusCodes.NOT_FOUND,"token not found"));
    }else{
        let tokenResult = await Tokens.findOne({where:{token}});
        
        if(tokenResult == null ) return res.json(responseModel("failed",statusCodes.NOT_ACCEPTABLE,"token not acceptable."))
        
        jwt.verify(token,process.env.TOKEN_SECRET,(error,user)=>{
            if(error) return res.json(responseModel("failed",statusCodes.NOT_ACCEPTABLE,false,"invalid  token provided."));
            
            req.user = user ;
            req.token = token;
            next();

        })
            
    }
    
}




module.exports = {authenticateUser}