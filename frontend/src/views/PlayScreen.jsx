import React, { useEffect, useState, useRef, useTransition } from "react";
import { io } from "socket.io-client";
import { Buffer } from "buffer";
import PlayerCard from "../components/PlayerCard";
import WordBar from "../components/WordBar";
import { wordsArray, getWordsArrayLength, getWordsByLanguage } from "../components/Words";
import { useNavigate, useLocation } from "react-router-dom";

function PlayScreen() {
  const canvasRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [mousePosition, setMousePosition] = useState(undefined);
  const [color, setColor] = useState("#000000"); // Default color is black
  const [startPoint, setStartPoint] = useState(null);
  const [lines, setLines] = useState([]); // Array to store drawn lines
  const [straightLineMode, setStraightLineMode] = useState(false); // Straight line drawing mode
  const [radius, setRadius] = useState(5); // Default radius is 5
  const [isEraser, setIsEraser] = useState(false); // Default is drawing mode
  const [context, setContext] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [allChats, setAllChats] = useState([]);
  const [allPlayers, setAllPlayer] = useState([]);
  const [socket, setSocket] = useState(null);
  const [currentUserDrawing, setCurrentUserDrawing] = useState(false);
  const [gameStarted, setgameStarted] = useState(false);
  const [playerDrawing, setPlayerDrawing] = useState(null);
  const [showWords, setShowWords] = useState(false);
  const [words, setWords] = useState(["car", "bike", "cycle"]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showClock, setShowClock] = useState(false);
  const [wordLen, setWordLen] = useState(0);
  const [guessedWord, setGuessedWord] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate()
  const location = useLocation()
  const userDataRecieved = location.state || {};
  // TODO: Update ENDPOINT to your Render deployment URL after deployment
  const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:3001";
  const ENDPOINT_LOCAL = "http://localhost:3001/";
  
  useEffect(() => {
    console.log("user Data received", userDataRecieved)
    let us = localStorage.getItem("username");
    let currentRoomCode = userDataRecieved.roomCode || localStorage.getItem("roomCode");
    let isHost = userDataRecieved.isHost === true || localStorage.getItem("isHost") === "true";
    let currentLanguage = userDataRecieved.language || localStorage.getItem("language") || "en";
    
    if(currentRoomCode) {
      setRoomCode(currentRoomCode);
    }
    
    if(currentLanguage) {
      setLanguage(currentLanguage);
    }
    
    if(!us || !userDataRecieved.username || !userDataRecieved.avatar || !currentRoomCode){
      alert("Missing required information. Redirecting to home.");
      navigate("/")
      return;
    }
    
    const newSocket = io(ENDPOINT);
    
    setSocket(newSocket);

    // Handle room errors
    newSocket.on("room-error", (error) => {
      console.error("Room error:", error);
      alert(error.message || "Error joining room. Redirecting to home.");
      navigate("/");
    });

    // Join room when socket connects
    const joinRoom = () => {
      console.log("Socket connected, joining room:", currentRoomCode);
      newSocket.emit("join-room", { roomCode: currentRoomCode, isHost });
    };

    if (newSocket.connected) {
      joinRoom();
    } else {
      newSocket.on("connect", joinRoom);
    }

    window.onbeforeunload=()=>{
      localStorage.removeItem("username");
      localStorage.removeItem("roomCode");
      localStorage.removeItem("isHost");
    };
    
    return()=>{
      if(newSocket){
        newSocket.disconnect();
      }
      localStorage.removeItem("username");
      localStorage.removeItem("roomCode");
      localStorage.removeItem("isHost");
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("updated-players", (updatedplayers) => {
        console.log("updated Players", updatedplayers);
        setAllPlayer(updatedplayers);
      });
    }
  }, [socket]);

  useEffect(()=>{
    if(socket){
      socket.on("send-user-data",()=>{
        console.log("sending user data")
        let userdata= {
          username: userDataRecieved.username,
          avatar: userDataRecieved.avatar
        }
        socket.emit("recieve-user-data",userdata)
      })
    }

  },[socket])

  useEffect(() => {
    if (socket) {
      //  socket.on("drawing", ({ x0, y0, x1, y1, color })=>{
      //   // drawLine(context, x0, y0, x1, y1, color, false);
      //  })
      socket.on("receiving", async (data) => {
        //   console.log(data)
        // console.log("data recieved in frontend")

        //   const offsetX=data.x
        //   const offsetY=data.y

        // await context.lineTo(offsetX, offsetY);
        // await context.stroke();

        // await context.beginPath();
        // await context.arc(offsetX, offsetY,5,0,Math.PI*2)
        // await context.fill()
        // // context.stroke()
        // await context.beginPath();
        // await context.moveTo(offsetX, offsetY)
        // await context.stroke()
        // await context.beginPath()

        const base64String = data.split(",")[1];
        const buffer = Buffer.from(base64String, "base64");
        const byteArray = new Uint8Array(buffer);
        const blob = new Blob([byteArray], { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          // if(context){
          context.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          context.drawImage(img, 0, 0);
          // }
        };
        img.src = imageUrl;
      });
    }
    //  return()=>{
    //   socket.disconnect()
    //  }
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    setContext(ctx);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = radius; // Set initial radius
    ctx.strokeStyle = color; // Set initial color
    setContext(ctx);
  }, [color, radius]);
  useEffect(() => {
    if (socket) {
      socket.on("game-start", () => {
        console.log("game started");
        setgameStarted(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("game-already-started", () => {
        setgameStarted(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("game-stop", () => {
        console.log("game stopped");
        setgameStarted(false);
        setShowClock(false);
        setCurrentUserDrawing(false);
        setPlayerDrawing(null);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("start-turn", (player) => {
        console.log("turn started of", player);
        setGuessedWord(false);
        clearCanvasAfterTurn(); // setPlayerDrawing(player)
        setPlayerDrawing(player);
        //getwiords function call
        let newRandomWords = getRandomWords();
        setWords(newRandomWords);
        setShowWords(true);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("word-len", (wl) => {
        console.log("selected word length", wl);
        setWordLen(wl);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("start-draw", (player) => {
        console.log("drawing started of", player);
        setShowWords(false);
        setShowClock(true);
        clearCanvasAfterTurn(); // setPlayerDrawing(player)
        // setPlayerDrawing(player)
        if (player.id === socket.id) {
          console.log("your turn started");
          setCurrentUserDrawing(true);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("all-guessed-correct", () => {
        console.log("all players guessed the word correct, end the timer");
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("end-turn", (player) => {
        console.log("turn ended of", player);
        setGuessedWord(false);
        setPlayerDrawing(null);
        setShowClock(false);
        setSelectedWord(null);
        if (socket.id === player.id) {
          console.log("your turn ended!");
          setCurrentUserDrawing(false);
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("recieve-chat", ({ msg, player, rightGuess, players }) => {
        console.log(msg, player, rightGuess, players);
        setAllPlayer(players);
        if (rightGuess) {
          // will be adding an attr to chat object later for the green colour
          // one option that can be further explored is that push the messages in efrontend withut sending all chats from the backend
          if (player.id === socket.id) {
            // chats.pop();
            setGuessedWord(true);
            setAllChats((prevchats) => [
              {
                sender: "you",
                message: `you guessed the right word! (${msg})`,
                rightGuess,
              },
              ...prevchats,
            ]);
          } else {
            setAllChats((prevchats) => [
              {
                sender: player.name,
                message: `${player.name} guessed the word right!`,
                rightGuess,
              },
              ...prevchats,
            ]);
          }
        } else {
          if (player.id === socket.id) {
            // allChats.push({sender: "you", message: inputMessage})
            // setAllChats([...allChats, {sender: "you", message: inputMessage}])
            // console.log(allChats)
            // allChats.push({sender: "you", message: msg})
            // let newChats = [...allChats]
            // console.log(newChats)
            // let newChat = {sender: "you", message: msg}
            // newChats.push(newChat)
            // console.log(newChats)
            // setAllChats(newChats)
            setAllChats((prevchats) => [
              { sender: "you", message: msg, rightGuess },
              ...prevchats,
            ]);
          } else {
            setAllChats((prevchats) => [
              { sender: player.name, message: msg, rightGuess },
              ...prevchats,
            ]);
          }
        }
        // setAllChats(chats.reverse());
      });
    }
  }, [socket]);

  // useEffect(()=>{
  //     if(socket){
  //       socket.on("right-guess",()=>{
  //         console.log("Congratulations! you guessed the right word")
  //       })
  //     }
  // },[socket])

  const startPaint = (event) => {
    if (!currentUserDrawing) return;

    const coordinates = getCoordinates(event);
    console.log(context);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
      if (straightLineMode) {
        setStartPoint(coordinates);
      }
    }
  };

  const paint = (event) => {
    if (!isPainting || straightLineMode) {
      return;
    }
    const newMousePosition = getCoordinates(event);
    if (mousePosition && newMousePosition) {
      if (isEraser) {
        eraseLine(newMousePosition);
      } else {
        drawLine(newMousePosition);
      }
      setMousePosition(newMousePosition);
    }
  };

  const exitPaint = () => {
    setIsPainting(false);
    setMousePosition(undefined);
    setStartPoint(null);
  };

  const getCoordinates = (event) => {
    // const canvas = canvasRef.current;
    return {
      x: event.pageX - canvasRef.current.offsetLeft,
      y: event.pageY - canvasRef.current.offsetTop,
    };
  };

  const drawLine = async (position) => {
    // const canvas = canvasRef.current;
    // const context = canvas.getContext('2d');
    // if (context) {
    context.strokeStyle = color; // Set the stroke style to the current color
    context.beginPath(); // Start a new path for each line segment
    context.moveTo(mousePosition.x, mousePosition.y);
    context.lineTo(position.x, position.y);
    context.lineWidth = radius;

    context.stroke();
    const dataURL = await canvasRef.current.toDataURL("image/png");
    socket.emit("sending", dataURL);
    const newLines = [
      ...lines,
      { start: mousePosition, end: position, color, radius },
    ];
    setLines(newLines);
    setMousePosition(position); // Update mouse position
    // }
  };
  const handleMouseUp = (event) => {
    if (straightLineMode && startPoint) {
      drawStraightLine(event);
    }
    exitPaint();
  };

  const drawStraightLine = async (event) => {
    // const canvas = canvasRef.current;
    // const context = canvas.getContext('2d');

    // Handle potential errors (optional)
    // if (!canvas || !context) {
    //   console.error('Canvas or context unavailable for drawing line.');
    //   return;
    // }

    // Check if straight line mode is enabled and startPoint is set
    if (straightLineMode && startPoint) {
      const endPoint = getCoordinates(event); // Get release coordinates

      context.strokeStyle = color;
      context.lineWidth = radius;
      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      context.lineTo(endPoint.x, endPoint.y);
      context.stroke();

      const dataURL = await canvasRef.current.toDataURL("image/png");
      socket.emit("sending", dataURL);
      // Reset startPoint for next straight line
      setStartPoint(null);
    }
  };
  const eraseLine = async (position) => {
    // const canvas = canvasRef.current;
    // const context = canvas.getContext('2d');
    // if (context) {
    const imageData = context.getImageData(
      position.x - radius,
      position.y - radius,
      2 * radius,
      2 * radius
    );
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Set alpha channel to 0 to erase
      data[i + 3] = 0;
    }
    context.putImageData(imageData, position.x - radius, position.y - radius);

    const dataURL = await canvasRef.current.toDataURL("image/png");
    socket.emit("sending", dataURL);
    const newLines = lines.filter((line) => {
      const startX = Math.min(line.start.x, line.end.x) - radius;
      const endX = Math.max(line.start.x, line.end.x) + radius;
      const startY = Math.min(line.start.y, line.end.y) - radius;
      const endY = Math.max(line.start.y, line.end.y) + radius;
      return (
        position.x < startX ||
        position.x > endX ||
        position.y < startY ||
        position.y > endY
      );
    });
    setLines(newLines);
    // }
  };
  const fillCanvas = async () => {
    // const canvas = canvasRef.current;
    // if (!canvas) {
    //     console.error('Canvas element not found.');
    //     return;
    // }

    // const context = canvas.getContext('2d');
    // if (!context) {
    //     console.error('Canvas context not available.');
    //     return;
    // }
    if (!currentUserDrawing) return;

    context.fillStyle = color; // Set the fill color to the current color
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Fill the entire canvas
    const dataURL = await canvasRef.current.toDataURL("image/png");
    socket.emit("sending", dataURL);
  };

  const clearCanvas = async () => {
    // const canvas = canvasRef.current;
    // const context = canvas.getContext('2d');
    // if (context) {
    if (!currentUserDrawing) return;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setLines([]);
    const dataURL = await canvasRef.current.toDataURL("image/png");
    socket.emit("sending", dataURL);
  };

  const clearCanvasAfterTurn = () => {
    if (context) {
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  };
  const handleChangeText = (e) => {
    setInputMessage(e.target.value);
  };
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!inputMessage) {
      return;
    }
    console.log(inputMessage);
    socket.emit("sending-chat", inputMessage.toLocaleLowerCase());
    console.log("socekt in send msg:", socket.id);
    setInputMessage("");
  };

  const handleWorSelect = (w) => {
    setShowWords(false);
    setSelectedWord(w);
    //emit to bacikend this wordd
    socket.emit("word-select", w);
    setWords([]);
  };

  const getRandomWords = () => {
    const wordsForLanguage = getWordsByLanguage(language);
    let lengthWordArray = wordsForLanguage.length;
    let newWordsArray = [];
    let newIndex;
    let prevIndex = -1;
    for (let i = 0; i < 3; i++) {
      newIndex = Math.floor(Math.random() * lengthWordArray);

      while (newIndex === prevIndex) {
        newIndex = Math.floor(Math.random() * lengthWordArray);
      }
      newWordsArray.push(wordsForLanguage[newIndex]);
      prevIndex = newIndex;
    }
    console.log("Random words for language", language, ":", newWordsArray);
    return newWordsArray;
  };

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error("Failed to copy:", err);
      });
    }
  };

  const basicColors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#C0C0C0",
    "#808080",
    "#FFFFFF",
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`relative w-screen h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Top Right Controls - Room Code & Theme Toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-3 items-start">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-3 rounded-lg shadow-lg transition-all duration-300 ${
            darkMode 
              ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        
        {/* Room Code Display */}
        {roomCode && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="text-white">
              <div className="text-xs font-semibold mb-1 opacity-90">Room Code</div>
              <div className="text-2xl font-bold tracking-widest">{roomCode}</div>
            </div>
            <button
              onClick={copyRoomCode}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-sm whitespace-nowrap"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        )}
      </div>
      <div className="w-full h-full flex flex-col justify-center items-center gap-4">
        <div>
          <WordBar
            showClock={showClock}
            wordLen={wordLen}
            gameStarted={gameStarted}
            showWords={showWords}
            currentUserDrawing={currentUserDrawing}
            selectedWord={selectedWord}
            darkMode={darkMode}
          />
        </div>
        <div className="w-full flex justify-center items-center gap-10">
          <div className={`w-[300px] h-[540px] border rounded-lg ${
            darkMode 
              ? 'border-gray-700 bg-gray-800 text-white' 
              : 'border-gray-300 bg-white text-black'
          } shadow-lg transition-colors duration-300`}>
            {allPlayers &&
              allPlayers.map((pl, idx) => (
                <PlayerCard
                  key={idx}
                  pl={pl}
                  curruser={pl.id === socket.id}
                  playerDrawing={playerDrawing}
                />
              ))}
          </div>
          <div className="w-[680px] h-[540px] relative">
            <canvas
              ref={canvasRef}
              width={680}
              height={540}
              onMouseDown={startPaint}
              onMouseMove={paint}
              onMouseUp={handleMouseUp}
              onMouseLeave={exitPaint}
              className={`rounded-lg shadow-lg transition-all duration-300 ${!currentUserDrawing ? "cursor-not-allowed" : ""}`}
              style={{ 
                border: darkMode ? "2px solid #4B5563" : "2px solid #E5E7EB", 
                backgroundColor: darkMode ? "#1F2937" : "white" 
              }}
            />
            <div>
              {showWords && playerDrawing && playerDrawing.id === socket.id && (
                <div className={`absolute top-0 left-0 h-full w-full flex justify-center gap-10 items-center z-10 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-900 bg-opacity-95' : 'bg-white bg-opacity-90'
                }`}>
                  {words.map((w, idx) => (
                    <div
                      onClick={() => handleWorSelect(w)}
                      key={idx}
                      className={`text-center w-36 h-10 flex items-center justify-center border-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-105 ${
                        darkMode 
                          ? 'text-white border-gray-500 bg-gray-800 hover:bg-gray-700 hover:border-gray-400' 
                          : 'text-black border-gray-800 bg-white hover:bg-gray-100'
                      }`}
                    >
                      {w}
                    </div>
                  ))}
                </div>
              )}
              {showWords && playerDrawing && playerDrawing.id !== socket.id && (
                <div className={`absolute h-full w-full top-0 left-0 flex justify-center items-center z-10 rounded-lg transition-colors duration-300 ${
                  darkMode 
                    ? 'text-white bg-gray-900 bg-opacity-95' 
                    : 'text-black bg-white bg-opacity-90'
                }`}>
                  {`${playerDrawing.name} is choosing a word`}
                </div>
              )}
            </div>
          </div>
          <div className={`w-[300px] h-[540px] border rounded-lg flex flex-col-reverse p-1 shadow-lg transition-colors duration-300 ${
            darkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-300 bg-white'
          }`}>
            <form
              onSubmit={(e) => {
                handleSubmitForm(e);
              }}
            >
              <input
                value={inputMessage}
                placeholder="Type your guess here"
                className={`min-w-full active max-w-full flex flex-wrap px-6 py-2 rounded-lg font-medium text-md focus:outline-none focus:ring-0 transition-colors duration-300 ${
                  darkMode
                    ? `bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-600 focus:shadow-[0_0px_10px_2px_rgba(59,130,246,0.3)] ${
                        currentUserDrawing || showWords || !gameStarted
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`
                    : `bg-sky-50 bg-opacity-40 border border-blue-300 text-black placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:shadow-[0_0px_10px_2px_#bfdbfe] ${
                        currentUserDrawing || showWords || !gameStarted
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`
                }`}
                onChange={(e) => handleChangeText(e)}
                disabled={currentUserDrawing || showWords || !gameStarted || guessedWord}
              ></input>
            </form>
            {allChats &&
              allChats.length > 0 &&
              allChats.map((chat, idx) => (
                <p
                  className={`px-2 py-1 rounded transition-colors duration-300 ${
                    chat.rightGuess 
                      ? darkMode 
                        ? "bg-green-900 text-green-300" 
                        : "bg-green-200 text-green-600"
                      : darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                  }`}
                  key={idx}
                >
                  {chat.rightGuess
                    ? chat.message
                    : `${chat.sender}: ${chat.message}`}
                </p>
              ))}
          </div>
        </div>
        {currentUserDrawing && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              {basicColors.map((c, index) => (
                <button
                  key={index}
                  style={{
                    backgroundColor: c,
                    width: "40px",
                    height: "40px",
                    margin: "0 5px",
                    border: `2px solid ${darkMode ? "#4B5563" : "#333"}`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxShadow: darkMode 
                      ? "3px 3px 5px rgba(0, 0, 0, 0.5)" 
                      : "3px 3px 5px rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => setColor(c)}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "#FFA500";
                    e.target.style.transform = "scale(1.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = darkMode ? "#4B5563" : "#333";
                    e.target.style.transform = "scale(1)";
                  }}
                  className="zoom-btn"
                />
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
              }}
            >
              <button
                className="zoom-btn"
                style={{
                  backgroundColor: darkMode ? "#374151" : "black",
                  padding: "8px 20px",
                  margin: "0 10px",
                  border: `2px solid ${darkMode ? "#4B5563" : "black"}`,
                  borderRadius: "10px",
                  fontFamily: "Comic Sans MS",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setIsEraser(!isEraser)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#4B5563" : "#333";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#374151" : "black";
                  e.target.style.transform = "scale(1)";
                }}
              >
                {isEraser ? "Draw" : "Eraser"}
              </button>
              <button
                className="zoom-btn"
                style={{
                  backgroundColor: darkMode ? "#374151" : "black",
                  padding: "8px 20px",
                  margin: "0 10px",
                  border: `2px solid ${darkMode ? "#4B5563" : "black"}`,
                  borderRadius: "10px",
                  fontFamily: "Comic Sans MS",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={() => setStraightLineMode(!straightLineMode)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#4B5563" : "#333";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#374151" : "black";
                  e.target.style.transform = "scale(1)";
                }}
              >
                {straightLineMode
                  ? "Disable Straight Line"
                  : "Enable Straight Line"}
              </button>
              <button
                className="zoom-btn"
                style={{
                  backgroundColor: darkMode ? "#374151" : "black",
                  padding: "8px 20px",
                  margin: "0 10px",
                  border: `2px solid ${darkMode ? "#4B5563" : "black"}`,
                  borderRadius: "10px",
                  fontFamily: "Comic Sans MS",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={fillCanvas}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#4B5563" : "#333";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#374151" : "black";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Fill Canvas
              </button>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  if (e.target.value !== color) {
                    setColor(e.target.value);
                  }
                }}
                style={{ marginLeft: "10px", marginRight: "10px" }}
              />
              <label style={{ color: darkMode ? "white" : "black" }}>Radius:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                style={{ 
                  marginLeft: "5px", 
                  marginRight: "10px",
                  accentColor: darkMode ? "#6366F1" : "#000"
                }}
              />

              <button
                className="zoom-btn"
                style={{
                  backgroundColor: darkMode ? "#374151" : "black",
                  padding: "8px 20px",
                  margin: "0 10px",
                  border: `2px solid ${darkMode ? "#4B5563" : "black"}`,
                  borderRadius: "10px",
                  fontFamily: "Comic Sans MS",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onClick={clearCanvas}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#4B5563" : "#333";
                  e.target.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = darkMode ? "#374151" : "black";
                  e.target.style.transform = "scale(1)";
                }}
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayScreen;

// className={`${!currentUserDrawing?"cursor-not-allowed":""}`}
//
