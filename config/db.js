const { Sequelize } = require("sequelize");

const sequelize = new Sequelize('ddn62b6rad4doj', 'bothpxxmcvxanh', '69b42f3218a3f218508253362e8ae7d4632d776abd633e2d0e9daad0f8088e72', {
  host: 'ec2-54-162-211-113.compute-1.amazonaws.com',
  dialect: 'postgres',
  native: true,
  ssl: false,
  dialectOptions: {
    "ssl": false
  }
});

module.exports = sequelize;