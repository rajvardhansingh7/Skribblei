// HomeScreen.jsx
import React, { useState } from "react";
import "../App.css";
import AvatarChanger from "../components/AvatarChanger";
import Footer from "../components/Footer";
import { createAvatar } from '@dicebear/core';
import { openPeeps, adventurer, avataaars, bigEars, bigSmile, bottts, croodles, funEmoji, lorelei, loreleiNeutral, micah, miniavs, notionists, personas } from '@dicebear/collection';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatar, setAvatar] = useState(() => generateAvatar());
  const [roomCode, setRoomCode] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  function generateAvatar() {
    const collections = [
      openPeeps, adventurer, avataaars, bigEars, bigSmile,
      bottts, croodles, funEmoji, lorelei, loreleiNeutral, micah,
      miniavs, notionists, personas
    ];
    const selectedCollection = collections[Math.floor(Math.random() * collections.length)];
    const avatarSvg = createAvatar(selectedCollection, {
      seed: Math.random().toString(),
      size: 128,
    });
    const base64String = btoa(unescape(encodeURIComponent(avatarSvg.toString())));
    return `data:image/svg+xml;base64,${base64String}`;
  }

  const changeAvatar = () => {
    setAvatar(generateAvatar());
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleRoomCodeChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setRoomCode(value);
    setIsCreatingRoom(false);
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if(!username || !avatar || !language){
      alert("Please fill in all the details (name and language)");
      return;
    }
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    setIsCreatingRoom(true);
    // Automatically navigate to play screen after creating room
    handlePlayButtonClick(newRoomCode, true);
  };

  const handlePlayButtonClick = (code = null, isHost = false) => {
    const finalRoomCode = code || roomCode;
    
    if(!username || !avatar || !language){
      alert("Please fill in all the details (name and language)");
      return;
    }
    
    if(!finalRoomCode || finalRoomCode.trim() === ""){
      alert("Please create a room or enter a room code to join");
      return;
    }

    const userData = {
      username,
      language,
      avatar,
      roomCode: finalRoomCode,
      isHost
    };
    console.log("User Data:", userData);
    localStorage.setItem("username", username);
    localStorage.setItem("roomCode", finalRoomCode);
    localStorage.setItem("isHost", isHost.toString());
    localStorage.setItem("language", language);
    navigate('/play', { state: { username, avatar, roomCode: finalRoomCode, isHost, language } });
  };

  return (
    <div>
      <header className="app-header">
        <h1>Skribblei</h1>
      </header>
      <div className="main-container">
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter your Name"
            className="input"
            value={username}
            onChange={handleUsernameChange}
          />
          <select className="input" value={language} onChange={handleLanguageChange}>
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>
        <AvatarChanger avatar={avatar} setAvatar={setAvatar} generateAvatar={generateAvatar} changeAvatar={changeAvatar} />
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Enter room code to join"
              className="room-code-input"
              value={roomCode}
              onChange={handleRoomCodeChange}
              style={{ flex: 1 }}
              readOnly={isCreatingRoom}
              maxLength={6}
            />
            <button 
              className="create-room-button" 
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
          </div>
          {roomCode && (
            <div style={{ 
              textAlign: 'center', 
              color: '#09F081', 
              fontSize: '14px', 
              fontWeight: '600',
              textShadow: '0 0 10px rgba(9, 240, 129, 0.5)',
              marginTop: '5px'
            }}>
              {isCreatingRoom ? '✓ Room Created!' : 'Ready to join room'}
            </div>
          )}
        </div>
        <button className="play-button" onClick={() => handlePlayButtonClick()}>
          {roomCode ? 'Join Room & Play!' : 'Enter Room Code to Play'}
        </button>
      </div>
      <Footer className="footer-icon" />
    </div>
  );
};

export default HomeScreen;
