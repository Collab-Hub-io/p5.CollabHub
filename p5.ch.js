/*
p5.ch - p5 library for Collab-Hub - https://www.collab-hub.io
Created by Nick Hwang, Anthony T. Marasco, Eric Sheffield
Version v0.1.0 alpha | June 18, 2022
*/


const socket = io("http://ch-server.herokuapp.com/hub"),
      controls = {},
      events = {};


// ----- socket event listeners

// socket.on("connected", () => {
//   console.info("Connected to Collab-Hub server.");
//   socket.emit()
// });

socket.on("serverMessage", incoming => {
   console.info(incoming.message);
});

socket.on("chat", incoming => {
  console.log(`${incoming.id}: "${incoming.chat}"`);
})

socket.on("otherUsers", incoming => {
  let userList = "",
      iterations = incoming.users.length;
  for(let u of incoming.users) {
    userList += --iterations ? `${u}, `: u;
  }
  console.info(`Connected users: ${userList}`);
});

// controls

socket.on("control", incoming => {
  let newHeader = incoming.header,
      newValues = incoming.values;
  controls[newHeader] = newValues;
});

socket.on("availableControls", incoming => {
  console.info("Available controls:")
  for (let e of incoming.controls) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

socket.on("observedControls", incoming => {
  console.info("Observed controls:")
  for (let e of incoming.controls) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

socket.on("myControls", incoming => {
  console.info("My controls:")
  for (let e of incoming.controls) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

// events

socket.on("event", incoming => {
  let newHeader = incoming.header;
  if (newHeader in events) {
    events[newHeader]();
  }
});

socket.on("availableEvents", incoming => {
  console.info("Available events:")
  for (let e of incoming.events) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

socket.on("observedEvents", incoming => {
  console.info("Observed events:")
  for (let e of incoming.events) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

socket.on("myEvents", incoming => {
  console.info("My events:")
  for (let e of incoming.events) {
    delete e.observers;
    delete e.mode;
    console.log(e)
  }
});

// rooms

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

  // sending data
  
  control: (...args) => {
    let mode = args[0] === "publish" || args[0] === "pub" ? "publish" : "push",
        header = mode === "publish" ? args[1] : args[0],
        values = mode === "publish" ? args[2] : args[1],
        target = args[3] ? args[3] : "all"; 
    const outgoing = {
      "mode" : mode,
      "header" : header,
      "values" : values,
      "target" : target
    }
    socket.emit("control", outgoing);
    return "Sending control..."
  },

  event: (...args) => {
    let mode = args[0] === "publish" || args[0] === "pub" ? "publish" : "push",
        header = mode === "publish" ? args[1] : args[0],
        target = args[2] ? args[2] : "all"; 
    const outgoing = {
      "mode" : mode,
      "header" : header,
      "target" : target
    }
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

  username: u => {
    socket.emit("addUsername", { "username": u });
    return "Requesting username..."
  },

  // requesting/using data
  getControl: h => {
    let data = h in controls ? controls[h] : 0;
    return data;
  },

  regEvent: (h, f) => {
    events[h] = f;
  },

  getUsers: () => {
    socket.emit("otherUsers");
    return "Getting user list..."
  },

  // room management

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
  },

  // control management

  observeControl: header => {
    let outgoing = { header: header };
    socket.emit("observeControl", outgoing);
    return `Observing control ${header}...`
  },

  unobserveControl: header => {
    let outgoing = { header: header };
    socket.emit("unobserveControl", outgoing);
    return `Un-observing control ${header}...`
  },

  observeAllControls: bool => {
    let outgoing = { observe: bool };
    socket.emit("observeAllControl", outgoing);
    socket.emit("getMyControls");
    return `Observing all controls...`
  },

  clearControl: header => {
    let outgoing = { header: header };
    socket.emit("clearControl", outgoing);
    socket.emit("getMyControls");
    return `Clearing control ${header}...`
  },

  // event management

  observeEvent: header => {
    let outgoing = { header: header };
    socket.emit("observeEvent", outgoing);
    return `Observing event ${header}...`
  },

  unobserveEvent: header => {
    let outgoing = { header: header };
    socket.emit("unobserveEvent", outgoing);
    return `Un-observing event ${header}...`
  },

  observeAllEvents: bool => {
    let outgoing = { observe: bool };
    socket.emit("observeAllEvents", outgoing);
    socket.emit("getMyEvents");
    return `Observing all events...`
  },

  clearEvent: header => {
    let outgoing = { header: header };
    socket.emit("clearEvent", outgoing);
    socket.emit("getMyEvents");
    return `Clearing event ${header}...`
  }

}
