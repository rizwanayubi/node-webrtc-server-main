const Sequelize = require("sequelize");
const db = require("../config/db");

const Participant = db.define("participant", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
    unique: false,
  },
  userProjectId: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  meetingId: {
    type: Sequelize.INTEGER,
  },
  projectId: {
    type: Sequelize.INTEGER
  },
  role: {
    type: Sequelize.STRING,
  },
});

module.exports = Participant;
