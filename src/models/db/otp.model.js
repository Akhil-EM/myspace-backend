module.exports = (sequelize,DataTypes) =>{
    const Otp = sequelize.define("Otp",{
        otp_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        otp:{
           type:DataTypes.STRING,
           allowNull:false,
        },
        type:{
            type:DataTypes.STRING,
            defaultValue:"VERIFICATION",
            allowNull:false
        },
        verified:{
            type:DataTypes.BOOLEAN,
            defaultValue:false,
            allowNull:false
        },
        verified_date:{
            type:DataTypes.DATE,
            defaultValue:null,
        },
    });

    return Otp;
}