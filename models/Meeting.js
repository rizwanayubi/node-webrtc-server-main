const Sequelize = require("sequelize");
const db = require("../config/db");

const Meeting = db.define("meeting", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  meetingName: {
    type: Sequelize.STRING,
  },
  projectId: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.BOOLEAN,
  },
});

module.exports = Meeting;
