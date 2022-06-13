/*
p5.ch - p5 library for Collab-Hub - https://www.collab-hub.io
Created by Nick Hwang, Anthony T. Marasco, Eric Sheffield
Version v0.1.0 alpha | June 13, 2022
*/


const socket = io("https://ch-server.herokuapp.com/hub"),
      controls = {},
      events = {};


// ----- socket event listeners

socket.on("connected", () => {
  console.info("Connected to Collab-Hub server.");
  socket.emit()
});

socket.on("serverMessage", incoming => {
   console.info(incoming.message);
});

socket.on("chat", incoming => {
  console.log(`${incoming.id}: "${incoming.chat}"`);
})

socket.on("control", incoming => {
  let newHeader = incoming.header,
      newValues = incoming.values;
  controls[newHeader] = newValues;
});

socket.on("event", incoming => {
  let newHeader = incoming.header;
  if (newHeader in events) {
    events[newHeader]();
  }
});

socket.on("otherUsers", incoming => {
  let userList = "",
      iterations = incoming.users.length;
  for(let u of incoming.users) {
    userList += --iterations ? `${u}, `: u;
  }
  console.info(`Connected users: ${userList}`);
});

socket.on("availableRoomsList", incoming => {
  let roomList = "",
      iterations = incoming.rooms.length;
  for(let r of incoming.rooms) {
    roomList += --iterations ? `${r}, `: r;
  }
  console.info(`Available rooms: ${roomList}`);
});


// ----- functions

const ch = {

  getControl: function(h) {
    let data = h in controls ? controls[h] : 0;
    return data;
  },

  regEvent: function(h, f) {
    events[h] = f;
  },

  username: function(u) {
    socket.emit("addUsername", { "username": u });
  },

  getUsers: function() {
    socket.emit("otherUsers");
    return "Getting user list..."
  },

  joinRoom: function(roomName) {
    let outgoing = { room: roomName };
    socket.emit("joinRoom", outgoing);
    return `Joining room ${roomName}...`
  },

  leaveRoom: function(roomName) {
    let outgoing = { room: roomName };
    socket.emit("leaveRoom", outgoing);
    return `Leaving room ${roomName}...`
  },

  getRooms: function() {
    socket.emit("getAvailableRooms");
    return "Getting available room list..."
  }

}