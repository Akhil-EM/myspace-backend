const dbConfig = require("../../config/db.config");

const {Sequelize,DataTypes} = require("sequelize");

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
      host:dbConfig.HOST,
      dialect:"mysql",
      operatorsAliases:0,
      pool:dbConfig.pool,
      logging:false,
    });


sequelize.authenticate()
         .then(()=> console.log("connected..."))
         .catch(error => console.log(error));

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize,DataTypes);
db.otps = require("./otp.model")(sequelize,DataTypes);
db.tokens = require("./token.model")(sequelize,DataTypes);
db.posts = require("./post.model")(sequelize,DataTypes);
db.friends = require("./friend.model")(sequelize,DataTypes);
db.requestStatus = require("./request-status.model")(sequelize,DataTypes);
db.messages = require("./message.model")(sequelize,DataTypes);

//this line is very important because 
//every time the server runs data get lost if it's set 
//to false
db.sequelize.sync({force:false})
            .then(()=>console.log("application re-syncing"))
            .catch(error=>console.log(error));


    
module.exports = db;
