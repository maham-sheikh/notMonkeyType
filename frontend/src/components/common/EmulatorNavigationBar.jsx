import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Toggler from '../ui/Toggler';
const NavigationBar = ({
  isMobile,
  handleDurationChange,
  testDuration,
  testStarted,
  startTest,
  endTest,
  mode,
  roomCode,
  setDifficultyLevel
}) => {
  const [selectedValue, setSelectedValue] = useState("beginner");

  const handleToggleChange = (value) => {
    setSelectedValue(value);
    setDifficultyLevel(value);
  };

  return (
    <nav className={`w-full p-4 backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg rounded-xl text-white ${isMobile ? "flex flex-col items-center" : "flex justify-between items-center"}`}>
      
      {/* Desktop Navigation */}
      {!isMobile && (
        <div className="flex items-center w-full px-6">
          <Link to="/home" className="px-4 py-2 bg-indigo-800 hover:bg-indigo-900 rounded-lg text-white transition">
            Back to Menu
          </Link>

          <h1 className="mx-6 text-2xl font-bold">notMonkeyType</h1>

          {mode === "SinglePlayer" && (
            <div className="flex items-center space-x-6">
              <span className="text-md">Mode: {mode}</span>
              <select className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1 outline-none focus:border-indigo-500 transition" onChange={handleDurationChange} value={testDuration}>
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={90}>90s</option>
                <option value={120}>120s</option>
              </select>
            </div>
          )}

          {mode === "MultiPlayer" && roomCode && (
            <div className="mx-6">
              <span className="text-md">Room Code: {roomCode}</span>
            </div>
          )}

          <button
            className="px-4 py-2 mx-2 bg-indigo-800 hover:bg-indigo-900 rounded-lg transition"
            onClick={testStarted ? endTest : startTest}
          >
            {testStarted ? "Stop" : "Start"}
          </button>

          {mode === "SinglePlayer" && (
            <div className="ml-auto">
              <Toggler selectedValue={selectedValue} onToggleChange={handleToggleChange} />
            </div>
          )}
        </div>
      )}

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="flex flex-col items-center space-y-4">
          <Link to="/home" className="px-6 py-2 bg-indigo-800 hover:bg-indigo-900 rounded-lg text-white transition">
            Back
          </Link>
          <h1 className="text-xl font-bold">notMonkeyType</h1>

          {mode === "MultiPlayer" && roomCode && (
            <div className="text-md">Room Code: {roomCode}</div>
          )}

          {mode === "SinglePlayer" && (
            <select className="bg-white/20 text-white border border-white/30 rounded-md px-3 py-1 outline-none focus:border-indigo-500 transition" onChange={handleDurationChange} value={testDuration}>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>120s</option>
            </select>
          )}

          <button
            className="px-6 py-2 bg-indigo-800 hover:bg-indigo-900 rounded-lg transition"
            onClick={testStarted ? endTest : startTest}
          >
            {testStarted ? "Stop" : "Start"}
          </button>

          {mode === "SinglePlayer" && (
            <Toggler selectedValue={selectedValue} onToggleChange={handleToggleChange} />
          )}
        </div>
      )}
    </nav>
  );
};

export default NavigationBar;
