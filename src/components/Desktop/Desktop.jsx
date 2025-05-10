import React from 'react';
import styled from 'styled-components';
import { useWallpaper } from '../../hooks/useWallpaper.jsx';
import { useWindowManager } from '../../hooks/useWindowManager.jsx';
import Window from '../Window/Window';
import Taskbar from '../Taskbar/Taskbar';

const DesktopContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #12141c;
  background-image: ${props => props.wallpaper ? `url(${props.wallpaper})` : 'none'};
  background-size: cover;
  background-position: center;
  transition: background-image 0.5s ease-in-out;
`;

const LoadingScreen = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #12141c;
  color: white;
  font-size: 24px;
  z-index: 9999;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #ffffff;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const WindowsContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Desktop = () => {
  const { wallpaper, loading, error } = useWallpaper();
  const { windows } = useWindowManager();

  if (loading) {
    return (
      <LoadingScreen>
        <LoadingSpinner />
        <div>Loading Desktop Environment...</div>
      </LoadingScreen>
    );
  }

  if (error) {
    return (
      <LoadingScreen>
        <div>Error: {error}</div>
      </LoadingScreen>
    );
  }

  const renderWindowComponent = (window) => {
    if (!window.app || !window.app.component) return null;
    
    const Component = window.app.component;
    return <Component id={window.id} />;
  };

  return (
    <DesktopContainer wallpaper={wallpaper}>
      <WindowsContainer>
        {windows.map(window => (
          <Window 
            key={window.id} 
            id={window.id}
          >
            {renderWindowComponent(window)}
          </Window>
        ))}
      </WindowsContainer>
      <Taskbar />
    </DesktopContainer>
  );
};

export default Desktop; 