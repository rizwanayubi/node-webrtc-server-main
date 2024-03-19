const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidV4 } = require("uuid");
const express = require("express");

const HttpError = require("../models/http-error");
const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant");
const Project = require("../models/Project");
const Note = require("../models/Note");
const router = express.Router();

router.post("/createMeeting", async (req, res, next) => {
  const { projectToken, meetingName, name, email, userProjectId } = req.body;

  let project;
  try {
    project = await Project.findOne({ where: { token: projectToken } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!project) {
    const error = new HttpError("You are not Authoirized", 401);
    return next(error);
  }

  let meeting;
  try {
    meeting = await Meeting.create({
      meetingName,
      projectId: project.id,
      status: true,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!meeting) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  let participant;
  try {
    participant = await Participant.create({
      name,
      email,
      userProjectId,
      meetingId: meeting.id,
      role: "host",
      projectId: project.id,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!participant) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  res.json({
    joinMeetingLink: `/${meeting.meetingName}?token=${meeting.id}$${project.token}&email=<participant_email>&name=<participant_name>&id=<participant_id>`,
    meetingName: `${meeting.meetingName}`,
    meetingToken: `${meeting.id}$${project.token}`,
  });
});

const getNotes = async (req, res, next) => {
  const meetingId = req.params.meetingId;

  let notes;
  try {
    notes = await Note.findOne({ where: { meetingId } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  res.send({ notes });
};

const getMeetings = async (req, res, next) => {
  const projectId = req.params.projectId;

  let project;
  try {
    project = await Project.findOne({ where: { token: projectId } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!project) {
    const error = new HttpError("You are not authorized.", 401);
    return next(error);
  }

  let meetings;
  try {
    meetings = await Meeting.findAll({ where: { projectId: project.id } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!meetings) {
    const error = new HttpError("No Meetings Found.", 400);
    return next(error);
  }

  let meetingData = [];
  for (let i = 0; i < meetings.length; i++) {
    let participants;
    try {
      participants = await Participant.findAll({
        where: { meetingId: meetings[i].id },
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError();
      return next(error);
    }
    let meeting = {};
    meeting.name = meetings[i].meetingName
    meeting.status = meetings[i].status
    meeting.id = meetings[i].id
    meeting.participants = participants
    meetingData.push(meeting);
  }

  res.status(200).send({ meetings: meetingData });
};

router.get("/meetings/:projectId", getMeetings);
router.get("/notes/:meetingId", getNotes);

// router.get("/notes/:projectId/:userId", async (req, res, next) => {
//   const userId = req.params.userId;
//   const projectId = req.params.projectId;

//   let project;
//   try {
//     project = await Project.findOne({ where: { token: projectId } });
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError();
//     return next(error);
//   }

//   if (!project) {
//     const error = new HttpError("You are not authorized.", 401);
//     return next(error);
//   }

//   let participant;
//   try {
//     participant = await Participant.findAll({
//       where: { userProjectId: userId, projectId: project.id, role: "host" },
//     });
//   } catch (err) {
//     console.log(err);
//     const error = new HttpError();
//     return next(error);
//   }

//   // return res.send(participant);

//   if (!participant) {
//     const error = new HttpError("No Meetings Found.", 200);
//     return next(error);
//   }

//   let allNotes = [];
//   for (let i = 0; i < participant.length; i++) {
//     const mId = parseInt(participant[i].meetingId);

//     let meeting;
//     let notes;
//     try {
//       meeting = await Meeting.findByPk(mId);
//     } catch (err) {
//       console.log(err);
//       const error = new HttpError();
//       return next(error);
//     }

//     // return res.send(meeting);
//     try {
//       notes = await Note.findOne({
//         where: {
//           meetingId: participant[i].meetingId,
//         },
//       });
//     } catch (err) {
//       console.log(err);
//       const error = new HttpError();
//       return next(error);
//     }
//     allNotes.push({ meeting, notes, participant });
//   }

//   res.send({ notes: allNotes });
// });

module.exports = router;
