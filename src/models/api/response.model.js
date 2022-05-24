const responseCodes = require("../../util/status-codes")
const response = (status = "success",code = responseCodes.OK,message = "OK",data = null) => 
({
  //status can be success failed or error
  status,code,message,data});

module.exports = response;