const db = require("./index");
const User = db.users
module.exports = (sequelize,DataTypes) =>{
    const RequestStatus = sequelize.define("RequestStatus",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        status:{
           type:DataTypes.STRING,
           allowNull:false,
           defaultValue:""
        },
    });

    return RequestStatus;
}