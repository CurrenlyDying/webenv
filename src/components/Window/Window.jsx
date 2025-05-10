import React, { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import styled from 'styled-components';
import { useWindowManager } from '../../hooks/useWindowManager.jsx';
import WindowHeader from './WindowHeader';

const StyledWindow = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 40, 0.75);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(100, 100, 120, 0.3);
  
  &:focus-within {
    border: 1px solid rgba(130, 130, 160, 0.5);
  }
`;

const WindowContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
  height: calc(100% - 36px);
`;

const Window = ({ id, children }) => {
  const { 
    windows, 
    activeWindowId, 
    focusWindow, 
    updateWindowPosition, 
    updateWindowSize 
  } = useWindowManager();
  
  const window = windows.find(w => w.id === id);
  const windowRef = useRef(null);
  
  useEffect(() => {
    if (windowRef.current && activeWindowId === id) {
      windowRef.current.focus();
    }
  }, [activeWindowId, id]);

  if (!window || window.isMinimized) {
    return null;
  }

  const handleFocus = () => {
    if (activeWindowId !== id) {
      focusWindow(id);
    }
  };

  return (
    <Rnd
      style={{
        zIndex: window.zIndex,
        position: 'absolute',
      }}
      default={{
        x: window.position.x,
        y: window.position.y,
        width: window.size.width,
        height: window.size.height,
      }}
      position={{ x: window.position.x, y: window.position.y }}
      size={{ width: window.size.width, height: window.size.height }}
      dragHandleClassName="window-drag-handle"
      onDragStop={(e, d) => {
        updateWindowPosition(id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        updateWindowSize(id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updateWindowPosition(id, position);
      }}
      minWidth={300}
      minHeight={200}
    >
      <StyledWindow 
        ref={windowRef} 
        onClick={handleFocus}
        tabIndex={-1}
        style={{ width: '100%', height: '100%' }}
      >
        <WindowHeader 
          id={id} 
          title={window.title} 
          icon={window.icon} 
        />
        <WindowContent>
          {children}
        </WindowContent>
      </StyledWindow>
    </Rnd>
  );
};

export default Window; 