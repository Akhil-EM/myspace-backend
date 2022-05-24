module.exports = (sequelize,DataTypes) =>{
    const Token = sequelize.define("Token",{
        token_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        token:{
           type:DataTypes.STRING,
           allowNull:false,
        },
        type:{
            type:DataTypes.STRING,
            defaultValue:"AUTHENTICATION",
            allowNull:false
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    });

    return Token;
}