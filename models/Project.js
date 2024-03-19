const Sequelize = require("sequelize");
const db = require("../config/db");
const User = require("./User");

const Project = db.define("project", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  token: {
    type: Sequelize.STRING,
  },
  userId: {
    type: Sequelize.INTEGER,
  },
});

module.exports = Project;
