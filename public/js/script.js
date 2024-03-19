const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const stopVideo = document.getElementById("stop-video");
const muteAudio = document.getElementById("mute-audio");
const mainLeft = document.getElementById("main__left");
const mainRight = document.getElementById("main__right");
const notesInput = document.getElementById("notes_input");
const endCallBtn = document.getElementById("end_meeting");

// const myPeer = new Peer(PEER_ID, {
//   path: "/peerjs",
//   host: "/",
//   port: 3000,
// });

// iceServers: [
//   {
//     url: "stun:tele.dentalchat.com:3478",
//     credential: "mughalfrazk",
//     username: "faraz1412",
//   },
//   {
//     url: "turn:tele.dentalchat.com:3478",
//     credential: "mughalfrazk",
//     username: "faraz1412",
//   },
//   // { url: "stun:stun01.sipphone.com" },
//   // { url: "stun:stun.ekiga.net" },
//   // { url: "stun:stun.fwdnet.net" },
//   // { url: "stun:stun.ideasip.com" },
//   // { url: "stun:stun.iptel.org" },
//   // { url: "stun:stun.rixtelecom.se" },
//   // { url: "stun:stun.schlund.de" },
//   { url: "stun:stun.l.google.com:19302" },
//   { url: "stun:stun1.l.google.com:19302" },
//   { url: "stun:stun2.l.google.com:19302" },
//   { url: "stun:stun3.l.google.com:19302" },
//   { url: "stun:stun4.l.google.com:19302" },
//   { url: "stun:stunserver.org" },
//   { url: "stun:stun.softjoys.com" },
//   { url: "stun:stun.voiparound.com" },
//   { url: "stun:stun.voipbuster.com" },
//   { url: "stun:stun.voipstunt.com" },
//   { url: "stun:stun.voxgratia.org" },
//   { url: "stun:stun.xten.com" },
//   {
//     url: "turn:numb.viagenie.ca",
//     credential: "muazkh",
//     username: "webrtc@live.com",
//   },
//   {
//     url: "turn:192.158.29.39:3478?transport=udp",
//     credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//     username: "28224511:1379330808",
//   },
//   {
//     url: "turn:192.158.29.39:3478?transport=tcp",
//     credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
//     username: "28224511:1379330808",
//   },
// ],

const myPeer = new Peer(
  PEER_ID,
  {
    config: {
      iceServers: [
        {
          urls: ["stun:bn-turn1.xirsys.com"],
        },
        {
          username:
            "guP_-Adya-hfLBXkankdYZfTaRfft9TtFZK4fb9PfnX0RDjCZnd2W-muSrl5Wu5dAAAAAGDrPCFkZW50YWxjaA==",
          credential: "11fd2ae2-e278-11eb-b9bd-0242ac140004",
          urls: [
            "turn:bn-turn1.xirsys.com:80?transport=udp",
            "turn:bn-turn1.xirsys.com:3478?transport=udp",
            "turn:bn-turn1.xirsys.com:80?transport=tcp",
            "turn:bn-turn1.xirsys.com:3478?transport=tcp",
            "turns:bn-turn1.xirsys.com:443?transport=tcp",
            "turns:bn-turn1.xirsys.com:5349?transport=tcp",
          ],
        },
      ],
    },
  },
  {
    path: "/peerjs",
    host: "tele.dentalchat.com",
    secure: true,
    port: 443,
  }
);

// console.log(window.location.host);

// const myPeer = new Peer(undefined, {
//   path: "/peerjs",
//   host: "/",
//   port: 3000,
// });

let myVideoStream;
const myVideo = document.createElement("video");
myVideo.className = "border";
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: { width: 320, height: 240 },
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      // connectToNewUser(userId, stream)
      setTimeout(connectToNewUser, 1000, userId, stream);
    });

    console.log(NOTES);

    if (PEER_ROLE === "host") {
      notesInput.innerHTML = NOTES;
      mainRight.classList.add("active");
      mainLeft.classList.add("active");
    }

    // input value
    let text = $("input");
    // when press enter send message
    // $("html").keydown(function (e) {
    //   if (e.which == 13 && text.val().length !== 0) {
    //     socket.emit("message", text.val());
    //     text.val("");
    //   }
    // });

    // socket.on("createMessage", (message) => {
    //   $("ul").append(
    //     `<li class="message"><b>${PARTICIPANT}</b><br/>${message}</li>`
    //   );
    //   scrollToBottom();
    // });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setVideoAudioIcons();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setVideoAudioIcons();
  }
};

const videoPlayStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setVideoAudioIcons();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setVideoAudioIcons();
  }
};

const setVideoAudioIcons = () => {
  if (myVideoStream.getAudioTracks()[0].enabled)
    muteAudio.innerHTML = '<i class="bi bi-mic-fill"></i><span>Mute</span>';
  else
    muteAudio.innerHTML =
      '<i class="bi bi-mic-mute-fill text-danger"></i><span>Unmute</span>';

  if (myVideoStream.getVideoTracks()[0].enabled)
    stopVideo.innerHTML =
      '<i class="bi bi-camera-video-fill"></i><span>Stop Video</span>';
  else
    stopVideo.innerHTML =
      '<i class="bi bi-camera-video-off-fill text-danger"></i><span>Start Video</span>';
};

notesInput.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    saveNotes();
  }
});

const saveNotes = () => {
  fetch("/save_notes", {
    method: "POST",
    body: JSON.stringify({
      id: PEER_ID,
      notes: notesInput.value,
      role: PEER_ROLE,
      meetingId: MEETING_ID,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((data) => {
    console.log(data);
  });
};

endCallBtn.addEventListener("click", () => {
  fetch("/end_meeting", {
    method: "POST",
    body: JSON.stringify({
      id: PEER_ID,
      name: PEER_NAME,
      role: PEER_ROLE,
      projectId: PEER_PROJECT_ID,
      meetingId: MEETING_ID,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(() => {
    window.location.href = "/end_meeting";
    console.log("Done");
  });
});
