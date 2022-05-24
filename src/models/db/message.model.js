const db = require("./index");
module.exports = (sequelize,DataTypes) =>{
    const Message = sequelize.define("Message",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        senderId:{//reefers to user table id
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        receiverId:{//reefers to user table id
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        message:{
           type:DataTypes.STRING,
           allowNull:false,
           defaultValue:""
        },
        deleted:{
            type:DataTypes.STRING,
            defaultValue:false,
            allowNull:false
        }
    });

    return Message;
}