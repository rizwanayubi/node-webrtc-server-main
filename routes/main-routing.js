const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidV4 } = require("uuid");

const HttpError = require("../models/http-error");
const Meeting = require("../models/Meeting");
const Participant = require("../models/Participant");
const Project = require("../models/Project");
const User = require("../models/User");
const Note = require("../models/Note");

router.get("/", (req, res, next) => {
  // res.redirect(`/${uuidV4()}`);
  res.render("index", { roomId: "hello" });
});

router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/registered", async (req, res, next) => {
  const { name, project, email, password } = req.body;
  if (!name || !project || !email || !password) {
    const error = new HttpError("Please complete all fields.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ where: { email } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User alreay exists", 409);
    return next(error);
  }

  let newUser;
  try {
    newUser = await User.create({ name, email, password: hashedPassword });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  let newProject;
  try {
    newProject = await Project.create({
      name: project,
      token: uuidV4(),
      userId: newUser.id,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  const projectToken = newProject.token;
  const meetingApi = `/api/createMeeting`;

  createMeetingApi = {
    endpoint: meetingApi,
    method: "POST",
    body: {
      projectToken: projectToken,
      meetingName: "your_meeting_name",
      name: "meeting_host_name",
      email: "meeting_host_email",
      userProjectId: "user_project_id",
    },
  };

  res.render("create_meeting", {
    user: newUser,
    project: newProject,
    createMeetingApi,
  });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ where: { email } });
  } catch (err) {
    const error = new HttpError();
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError();
    return next(error);
  }

  if (!hashedPassword) {
    const error = new HttpError("Invalid Credentials", 409);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(existingUser.email, "super_secret_jwt_key");
  } catch (err) {
    const error = new HttpError();
    return next(error);
  }

  req.session.payload = {
    token,
    email: existingUser.email,
    name: existingUser.name,
  };

  res.render("dashboard", { roomId: "" });
});

router.get("/createProject", async (req, res, next) => {
  res.send("Hello");
});

router.post("/createMeeting", async (req, res, next) => {
  const { projectToken, meetingName, name, email, userProjectId } = req.body;

  let project;
  try {
    project = await Project.findOne({ where: { token: projectToken } });
  } catch (err) {
    const error = new HttpError("hello01");
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
    const error = new HttpError("hello05");
    return next(error);
  }

  if (!meeting) {
    const error = new HttpError("hello04");
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
    const error = new HttpError("hello02");
    return next(error);
  }

  if (!participant) {
    const error = new HttpError("hello03");
    return next(error);
  }

  res.render("meeting_created", {
    joinMeetingLink: `/${meeting.meetingName}?token=${meeting.id}$${project.token}&email=_participant_email_&name=_participant_name_&id=_participant_id_`,
  });
});

router.get("/login", (req, res, next) => {
  res.render("login", { roomId: "" });
});

router.get("/end_meeting", (req, res, next) => {
  res.render("end_meeting");
});

router.post("/end_meeting", async (req, res, next) => {
  // res.send(req.body);
  const { id, name, role, projectaid, meetingId } = req.body;

  let meeting;
  try {
    meeting = await Meeting.findByPk(meetingId);
  } catch (err) {
    const error = new HttpError();
    return next(error);
  }

  let participant;
  try {
    participant = await Participant.findByPk(id);
  } catch (err) {
    const error = new HttpError();
    return next(error);
  }

  try {
    if (role === "host") {
      meeting.update({ status: false });
      await meeting.save();
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  res.send("Its Done");
});

router.post("/save_notes", async (req, res, next) => {
  const { id, meetingId, notes } = req.body;

  const text = notes.replace(/\n/g, " ");

  let checkNotes;
  try {
    checkNotes = await Note.findOne({
      where: { meetingId, participantId: id },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  try {
    if (checkNotes) {
      checkNotes.update({
        text,
      });
      await checkNotes.save();
    } else {
      checkNotes = await Note.create({
        meetingId,
        participantId: id,
        text,
      });
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  res.send({ notes: checkNotes });
});

router.get("/:room", async (req, res, next) => {
  if (!req.query.token) {
    const error = new HttpError("Token is required.", 401);
    return next(error);
  }

  if (!req.query.email || req.query.email == "_participant_email_" || req.query.email == "<participant_email>") {
    const error = new HttpError("Email is required.", 401);
    return next(error);
  }

  if (!req.query.name || req.query.name == "_participant_name_" || req.query.name == "<participant_name>") {
    const error = new HttpError("Name is required.", 401);
    return next(error);
  }

  if (!req.query.id || req.query.id == "_participant_id_" || req.query.id == "<participant_id>") {
    const error = new HttpError("id is required.", 401);
    return next(error);
  }
  const meetingId = req.query.token.split("$")[0];
  const token = req.query.token.split("$")[1];

  let project;
  try {
    project = await Project.findOne({ where: { token } });
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
    meeting = await Meeting.findOne({
      where: { id: meetingId },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  // console.log(meeting)
  console.log(meeting.projectId);
  console.log(project.id);

  if (!meeting || meeting.projectId != project.id) {
    return res.send({ meeting: meeting.projectId, project: project.Id });
    // const error = new HttpError("You are not Authorized");
    // return next(error);
  }

  if (meeting.meetingName !== req.params.room) {
    const error = new HttpError("Could not find any room");
    return next(error);
  }

  if (!meeting.status) {
    const error = new HttpError("This meeting has ended", 401);
    return next(error);
  }

  let checkParticipant;
  try {
    checkParticipant = await Participant.findOne({
      where: {
        email: req.query.email,
        meetingId: meetingId,
      },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (!checkParticipant) {
    let participant;
    try {
      participant = await Participant.create({
        name: req.query.name,
        email: req.query.email,
        userProjectId: req.query.id || null,
        meetingId: meetingId,
        role: "participant",
        projectId: project.id,
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError();
      return next(error);
    }
    checkParticipant = participant;
  }

  let checkNotes;
  try {
    checkNotes = await Note.findAll({ where: { meetingId: meeting.id } });
  } catch (err) {
    console.log(err);
    const error = new HttpError();
    return next(error);
  }

  if (checkNotes.length === 0) {
    return res.render("room", {
      roomId: req.params.room,
      participant_id: checkParticipant.id,
      participant: checkParticipant.name,
      participant_role: checkParticipant.role,
      participant_project_id: checkParticipant.userProjectId,
      meetingId: meeting.id,
      notes: null,
    });
  }

  res.render("room", {
    roomId: req.params.room,
    participant_id: checkParticipant.id,
    participant: checkParticipant.name,
    participant_role: checkParticipant.role,
    participant_project_id: checkParticipant.userProjectId,
    meetingId: meeting.id,
    notes: checkNotes[0].text,
  });
});

module.exports = router;
