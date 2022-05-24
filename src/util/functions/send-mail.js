const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user:process.env.FROM_MAIL,
           pass:process.env.MAIL_PASSWORD}
   });


module.exports = (_toMail,_subject,mail_string)=>{
    let email={
        to:_toMail,
        from:process.env.FROM_MAIL,
        subject:_subject,
        html:mail_string}

    return new Promise(async (resolve,reject)=>{
        try{
            await transporter.sendMail(email);
            resolve();
        }catch(error){
            reject(error.message)
        }
    })
    
}