const db = require("./index");
const Posts = db.posts
module.exports = (sequelize,DataTypes) =>{
    const User = sequelize.define("User",{
        user_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        type:{
            type:DataTypes.STRING,
            defaultValue:"USER",
            allowNull:false
        },
        email:{
           type:DataTypes.STRING,
           allowNull:false,
        },
        password:{
           type:DataTypes.STRING,
           allowNull:false
        },
        user_name:{
            type:DataTypes.STRING,
            defaultValue:null
        },
        profile_image:{
           type:DataTypes.STRING,
           defaultValue:null
        },
        email_verified:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        active:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        }
    });

   

    return User;
}