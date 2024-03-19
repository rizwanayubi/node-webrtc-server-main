const Sequelize = require("sequelize");
const db = require("../config/db");

const Note = db.define("note", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  text: {
    type: Sequelize.STRING,
  },
  meetingId: {
    type: Sequelize.INTEGER,
  },
  participantId: {
    type: Sequelize.INTEGER,
  },
});

module.exports = Note;
