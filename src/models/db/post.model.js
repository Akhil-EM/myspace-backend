const db = require("./index");
const User = db.users
module.exports = (sequelize,DataTypes) =>{
    const Post = sequelize.define("Post",{
        post_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        title:{
           type:DataTypes.STRING,
           allowNull:false,
           defaultValue:"VERIFICATION"
        },
        content:{
            type:DataTypes.STRING,
            defaultValue:"",
            allowNull:false
        },
        image:{
            type:DataTypes.STRING,
            default:null
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        archived:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
    });

    return Post;
}