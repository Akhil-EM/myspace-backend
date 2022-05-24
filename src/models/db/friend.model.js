const db = require("./index");
const User = db.users
module.exports = (sequelize,DataTypes) =>{
    const Friend = sequelize.define("Friend",{
        id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        friendOne:{//reefers to user table id
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        friendTwo:{//reefers to user table id
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        sendBy:{//reefers to user table id
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        receivedBy:{//reefers to user table id
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        requestStatusId:{
           type:DataTypes.INTEGER,
           allowNull:false,
           defaultValue:1
        }
    });

    return Friend;
}