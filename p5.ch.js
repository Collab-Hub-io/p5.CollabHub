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

  control: (h, v, t) => {
    const outgoing = {
      mode: "push",
      header: h,
      values: v
    };
    t ? outgoing.target = t : outgoing.target = "all";
    socket.emit("control", outgoing);
    return "Sending control..."
  },

  event: (h, t) => {
    const outgoing = {
      mode: "push",
      header: h
    };
    t ? outgoing.target = t : outgoing.target = "all";
    socket.emit("event", outgoing);
    return "Sending event..."
  },

  chat: (m, t) => {
    const outgoing = {
      chat: m
    };
    t ? outgoing.target = t : outgoing.target = "all";
    socket.emit("chat", outgoing);
    return "Sending chat message..."
  },

  getControl: h => {
    let data = h in controls ? controls[h] : 0;
    return data;
  },

  regEvent: (h, f) => {
    events[h] = f;
  },

  username: u => {
    socket.emit("addUsername", { "username": u });
  },

  getUsers: () => {
    socket.emit("otherUsers");
    return "Getting user list..."
  },

  joinRoom: roomName => {
    let outgoing = { room: roomName };
    socket.emit("joinRoom", outgoing);
    return `Joining room ${roomName}...`
  },

  leaveRoom: roomName => {
    let outgoing = { room: roomName };
    socket.emit("leaveRoom", outgoing);
    return `Leaving room ${roomName}...`
  },

  getRooms: () => {
    socket.emit("getAvailableRooms");
    return "Getting available room list..."
  }

}