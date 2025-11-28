const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  path: "/socket.io",
  transports: ["websocket", "polling"],
  connectionStateRecovery: {},
});
// const port = 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", methods: ["GET", "POST"], credentials: true }));
app.use(express.json());  



// Room management
const rooms = new Map(); // roomCode -> roomData

const createRoom = (roomCode) => {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      players: [],
      chats: [],
      word: null,
      drawerindex: 0,
      timeout: null,
      round: 0,
      playerGuessedRightWord: [],
      gameStarted: false,
      phase: "waiting"
    });
    console.log(`Room created: ${roomCode}`);
    return true;
  }
  return false;
};

const getRoom = (roomCode) => {
  return rooms.get(roomCode);
};

const startGame = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;
  
  console.log(`Game started in room: ${roomCode}. Current players:`, room.players.map(p => p.name));
  room.gameStarted = true;
  io.to(roomCode).emit("game-start", {});
  startTurn(roomCode);
};

const stopGame = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;

  console.log(`Game stopped in room: ${roomCode}`);
  room.gameStarted = false;
  io.to(roomCode).emit("game-stop", {});
  room.drawerindex = 0;
  if (room.timeout) {
    clearTimeout(room.timeout);
    room.timeout = null;
  }
};

const startTurn = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;

  if (room.drawerindex >= room.players.length) {
    room.drawerindex = 0;
  }
  // reset word and set phase to choosing
  room.word = null;
  room.phase = "choosing";
  //notify frontend for starting turn with this user
  io.to(roomCode).emit("start-turn", room.players[room.drawerindex]);
  //word generator
};

const startDraw = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;

  io.to(roomCode).emit("start-draw", room.players[room.drawerindex]);
  room.timeout = setTimeout(() => {
    endTurn(roomCode);
  }, 60000);
};

const endTurn = (roomCode) => {
  const room = getRoom(roomCode);
  if (!room) return;

  io.to(roomCode).emit("end-turn", room.players[room.drawerindex]);
  room.playerGuessedRightWord = [];
  if (room.timeout) {
    clearTimeout(room.timeout);
    room.timeout = null;
  }
  //notify turn ended for this user
  room.drawerindex = (room.drawerindex + 1) % room.players.length;
  //points logic
  startTurn(roomCode);
};

const cleanupRoom = (roomCode) => {
  const room = getRoom(roomCode);
  if (room && room.players.length === 0) {
    if (room.timeout) {
      clearTimeout(room.timeout);
    }
    rooms.delete(roomCode);
    console.log(`Room deleted: ${roomCode}`);
  }
};





io.on("connection", (socket) => {
  console.log("connected to socket.io");
  console.log("user connected", socket.id);
  
  let currentRoomCode = null;

  socket.on("join-room", ({ roomCode, isHost }) => {
    if (!roomCode) {
      socket.emit("room-error", { message: "Room code is required" });
      return;
    }

    // Create room if host
    if (isHost) {
      if (!createRoom(roomCode)) {
        socket.emit("room-error", { message: "Room already exists" });
        return;
      }
    } else {
      // Check if room exists when joining
      if (!rooms.has(roomCode)) {
        socket.emit("room-error", { message: "Room does not exist" });
        return;
      }
    }

    currentRoomCode = roomCode;
    socket.join(roomCode);
    console.log(`User ${socket.id} joined room ${roomCode}`);
    
    // Send existing players to the new user
    const room = getRoom(roomCode);
    if (room && room.players.length > 0) {
      socket.emit("updated-players", room.players);
      if (room.gameStarted) {
        socket.emit("game-already-started", {});
        const drawer = room.players[room.drawerindex];
        const wl = room.word ? room.word.length : 0;
        io.to(socket.id).emit("current-state", { phase: room.word ? "drawing" : "choosing", drawer, wordLen: wl });
      }
    }

    io.to(socket.id).emit("send-user-data", {});
  });

  socket.on("recieve-user-data", ({ username, avatar }) => {
    if (!currentRoomCode) {
      socket.emit("room-error", { message: "Not in a room" });
      return;
    }

    const room = getRoom(currentRoomCode);
    if (!room) {
      socket.emit("room-error", { message: "Room not found" });
      return;
    }

    let newUser = {
      id: socket.id,
      name: username,
      points: 0,
      avatar: avatar
    };
    
    room.players.push(newUser);
    console.log(`Player added to room ${currentRoomCode}:`, newUser);
    console.log(`Room ${currentRoomCode} now has ${room.players.length} players`);
    
    io.to(currentRoomCode).emit("updated-players", room.players);
    
    console.log(`Recieved user data for ${username} in room ${currentRoomCode}. Players in room: ${room.players.length}, Game started: ${room.gameStarted}`);
    if (!room.gameStarted && room.players.length >= 2) {
      console.log(`Attempting to start game in room ${currentRoomCode} with ${room.players.length} players.`);
      startGame(currentRoomCode);
    } else if (room.gameStarted) {
      socket.emit("game-already-started", {});
    }
  });

  socket.on("sending", (data) => {
    if (!currentRoomCode) return;
    console.log("data received in room", currentRoomCode);
    socket.to(currentRoomCode).emit("receiving", data);
  });

  socket.on("sending-chat", (inputMessage) => {
    if (!currentRoomCode) return;

    const room = getRoom(currentRoomCode);
    if (!room) return;

    const userID = socket.id;
    console.log("chat received in room", currentRoomCode, "from", userID);
    
    const index = room.players.findIndex(play => play.id === userID);
    if (index === -1) return;

    let rightGuess = false;
    if (room.word && inputMessage && inputMessage.toLowerCase() === room.word.toLowerCase()) {
      console.log("right guess in room", currentRoomCode);
      rightGuess = true;
      room.players[index].points += 100;
      room.chats.push(`${userID} Guessed the right word`);
    } else {
      room.chats.push(inputMessage);
    }

    let returnObject = {
      msg: inputMessage,
      player: room.players[index],
      rightGuess: rightGuess,
      players: room.players
    };
    
    io.to(currentRoomCode).emit("recieve-chat", returnObject);

    if (rightGuess) {
      let u = room.playerGuessedRightWord.filter(pla => pla === userID);
      console.log("u", u);
      if (u.length === 0) {
        room.playerGuessedRightWord.push(userID);
        if (room.playerGuessedRightWord.length === room.players.length - 1) {
          //emit to frontend for pause timer
          io.to(currentRoomCode).emit("all-guessed-correct", {});
          room.playerGuessedRightWord = [];
          endTurn(currentRoomCode);
        }
      }
    }
  });

  socket.on("word-select", (w) => {
    if (!currentRoomCode) return;

    const room = getRoom(currentRoomCode);
    if (!room) return;

    room.word = w;
    room.phase = "drawing";
    let wl = w.length;
    io.to(currentRoomCode).emit("word-len", wl);
    startDraw(currentRoomCode);
  });

  socket.on("disconnect", (reason) => {
    console.log(reason);
    console.log("USER DISCONNECTED:", socket.id);
    
    if (!currentRoomCode) return;

    const room = getRoom(currentRoomCode);
    if (!room) return;

    const index = room.players.findIndex(play => play.id === socket.id);
    console.log("Player index:", index);
    
    if (index > -1) {
      room.players.splice(index, 1);
      
      // Update drawer index if needed
      if (index < room.drawerindex) {
        room.drawerindex--;
      } else if (index === room.drawerindex && room.players.length > 0) {
        room.drawerindex = room.drawerindex % room.players.length;
      }
    }
    
    io.to(currentRoomCode).emit("updated-players", room.players);
    socket.to(currentRoomCode).emit("user-disconnected", {});
    
    if (room.players.length <= 0) {
      cleanupRoom(currentRoomCode);
    } else if (room.players.length === 1 && room.gameStarted) {
      stopGame(currentRoomCode);
    }

  });
});

// Serve React build files
const buildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Skribblei server listening on port ${PORT}`);
});
