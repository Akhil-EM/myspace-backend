const fs = require("fs");
const path =require("path");
module.exports ={
    writeLog:(errorType="app",file = "",line = 1,errorMessage="")=>{
        
        let timeNow = Date(Date.now());
        let log = `=>${timeNow}\n  file= ${file}  \n  type= ${errorType}\n  line=${line} \n  error= ${errorMessage}\n\n`;
        
  
        let  logFile = "app-log.txt";
        if(errorType === "sql")  logFile="sql-error-log.txt";
        
        fs.appendFile(`public/logs/${logFile}`,log, function(err){
            // Deal with possible error here.
            if(err){
                console.log(err.message);
                return err.message;
            } 
        });
    }
}