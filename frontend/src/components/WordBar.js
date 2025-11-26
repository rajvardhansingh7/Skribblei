import React, { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import './WordBar.css'; // Import the CSS file for styling

const UrgeWithPleasureComponent = () => (
  <CountdownCircleTimer
    isPlaying
    duration={60}
    size={80} // Set a suitable size for the clockx
    colors={['#004777', '#F7B801', '#A30000', '#A30000']}
    colorsTime={[60, 40, 20, 0]}
  >
    {({ remainingTime }) => (
      <div className="clock">
       <div className="hand second-hand" style={{ transform: `rotate(${(60 - remainingTime % 60) * 6 - 90}deg)` }} />
<div className="hand minute-hand" style={{ transform: `rotate(${(60 - remainingTime % 3600) * 0.1 - 90}deg)` }} />

        <div className="center-dot" />
        <div className="timer-text">{remainingTime}</div>
        <div className="leg left-leg" />
        <div className="leg right-leg" />
      </div>
    )}
  </CountdownCircleTimer>
);

const WordBar = ({ showClock, wordLen, gameStarted, showWords, currentUserDrawing, selectedWord, darkMode = false }) => {
  const [key, setKey] = useState(0);

  const handleClockClick = () => {
    // Handle clock icon click
    console.log('Clock icon clicked');
  };

  const handleSettingsClick = () => {
    // Handle settings icon click
    console.log('Settings icon clicked');
  };

  return (
    

    <div
      style={{
        width: '40vw', // 40% of the viewport width
        height: '90px', // Set the desired height
        margin: 'auto', // Center the box horizontally
        border: darkMode ? '2px solid #4B5563' : '2px solid black', // Blue border
        display: 'flex',
        justifyContent: 'space-between', // Space between items
        alignItems: 'center',
        padding: '10px', // Add padding of 10px
        // marginTop: '100px',
        position: 'relative', // Add position relative to align settings icon
        backgroundColor: darkMode ? '#1F2937' : '#f4faca', // Set the background color
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        boxShadow: darkMode 
          ? '0 4px 15px rgba(0, 0, 0, 0.5)' 
          : '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      {showClock && (
        <button 
          onClick={handleClockClick} 
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          className="timer-button" // Add a class to the button
        >
          <UrgeWithPleasureComponent />
        </button>
      )}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'absolute', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.5)',
        padding: '10px', // Add padding to space the text from the edges
        borderRadius: '5px', // Add border radius for rounded corners
        fontFamily: 'Comic Sans MS', // Set the font family to a cartoonish font
        fontWeight: 'bold', // Make the text bold
        fontSize: '24px' // Set the font size
      }}>

        {!gameStarted && 
        <div style={{
          fontWeight: 'bold', 
          fontSize: '24px', 
          fontFamily: 'Comic Sans MS', 
          color: darkMode ? '#fff' : '#000',
          transition: 'color 0.3s ease'
        }}>GAME NOT STARTED</div>
      }
      {gameStarted &&
      <>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '24px', 
          fontFamily: 'Comic Sans MS', 
          color: darkMode ? '#fff' : '#000',
          transition: 'color 0.3s ease'
        }}>{`${currentUserDrawing?"Draw":showWords?"Choosing":"GUESS THIS"}`}</div>

        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '24px', 
          fontFamily: 'Comic Sans MS', 
          color: darkMode ? '#fff' : '#000',
          transition: 'color 0.3s ease'
        }}>{`${currentUserDrawing && selectedWord?selectedWord.toUpperCase():showWords?"":"_ ".repeat(wordLen)}`}</div>
        </>
        }
      </div>
      {/* Clock icon */}
      <div style={{ flex: 1 }} /> {/* Empty div to push settings icon to the right */}
  
      {/* Settings icon */}
    </div>
  );
  
};

export default WordBar;
