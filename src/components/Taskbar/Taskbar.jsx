import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useWindowManager } from '../../hooks/useWindowManager.jsx';
import StartMenu from '../StartMenu/StartMenu';
import TaskbarIcon from './TaskbarIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripHorizontal } from '@fortawesome/free-solid-svg-icons';

const TaskbarContainer = styled.div`
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 1800px;
  height: 48px;
  background-color: rgba(30, 30, 40, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  border: 1px solid rgba(100, 100, 120, 0.3);
`;

const StartButton = styled.button`
  background-color: rgba(60, 60, 80, 0.5);
  border: none;
  border-radius: 18px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  font-size: 18px;
  
  &:hover {
    background-color: rgba(80, 80, 100, 0.7);
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
  }
`;

const OpenApps = styled.div`
  display: flex;
  margin-left: 16px;
  gap: 8px;
  overflow-x: auto;
  flex: 1;
  padding: 0 8px;
  max-width: 30%;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const CurrentActivityContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: 30%;
  text-align: center;
`;

const CurrentActivity = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SystemIcons = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-left: auto;
`;

const SystemIcon = styled.div`
  width: 20px;
  height: 20px;
  cursor: pointer;
  
  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
`;

const DateTime = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-left: 16px;
  white-space: nowrap;
`;

const Taskbar = () => {
  const { windows, activeWindowId, focusWindow } = useWindowManager();
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const activeWindow = windows.find(w => w.id === activeWindowId);
  
  // Show all windows in taskbar, including minimized ones
  const openWindows = windows;
  
  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };
  
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <TaskbarContainer>
        <StartButton onClick={toggleStartMenu}>
          <FontAwesomeIcon icon={faGripHorizontal} />
        </StartButton>
        
        <OpenApps>
          {openWindows.map(window => (
            <TaskbarIcon
              key={window.id}
              id={window.id}
              icon={window.app.icon}
              title={window.title}
              isActive={window.id === activeWindowId}
              isMinimized={window.isMinimized}
              bgColor={window.app.bgColor}
              onClick={() => focusWindow(window.id)}
            />
          ))}
        </OpenApps>
        
        <CurrentActivityContainer>
          <CurrentActivity>
            {activeWindow ? activeWindow.title : 'Desktop'}
          </CurrentActivity>
        </CurrentActivityContainer>
        
        <SystemIcons>
          {/* Volume Icon */}
          <SystemIcon title="Volume">
            <svg viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </SystemIcon>
          
          {/* Network Icon */}
          <SystemIcon title="Network">
            <svg viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
          </SystemIcon>
          
          {/* GitHub Icon */}
          <SystemIcon title="GitHub">
            <svg viewBox="0 0 24 24">
              <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2 2 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.83.74 1.2 1.74 1.2 2.94 0 4.21-2.57 5.13-5.04 5.4.45.37.82.92.82 2.02v3.03c0 .27.1.64.73.55A11 11 0 0012 1.27" />
            </svg>
          </SystemIcon>
          
          {/* LinkedIn Icon */}
          <SystemIcon title="LinkedIn">
            <svg viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </SystemIcon>
        </SystemIcons>
        
        <DateTime>{formatDate(currentTime)}</DateTime>
      </TaskbarContainer>
      
      {isStartMenuOpen && (
        <StartMenu onClose={() => setIsStartMenuOpen(false)} />
      )}
    </>
  );
};

export default Taskbar; 