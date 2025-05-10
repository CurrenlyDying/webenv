import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useWindowManager } from '../../hooks/useWindowManager.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTerminal, 
  faCube, 
  faFileLines, 
  faImages, 
  faMusic, 
  faComments 
} from '@fortawesome/free-solid-svg-icons';
import { Terminal } from '../index.js';

const MenuContainer = styled.div`
  position: fixed;
  top: 68px;
  left: 12px;
  width: 300px;
  background-color: rgba(35, 35, 45, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  overflow: hidden;
  border: 1px solid rgba(100, 100, 120, 0.3);
  animation: slideIn 0.2s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MenuHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(100, 100, 120, 0.3);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px;
  background-color: rgba(50, 50, 60, 0.5);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    background-color: rgba(60, 60, 70, 0.5);
  }
  
  &::placeholder {
    color: rgba(200, 200, 220, 0.5);
  }
`;

const MenuList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(100, 100, 120, 0.3);
    border-radius: 3px;
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(70, 70, 90, 0.5);
  }
`;

const AppIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  background-color: ${props => props.bgColor || '#6e7bb8'};
`;

const AppName = styled.div`
  color: white;
  font-size: 14px;
`;

// List of demo apps with Font Awesome icons
const demoApps = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: faTerminal,
    bgColor: '#333340',
    component: Terminal,
    defaultSize: { width: 800, height: 500 }
  },
  {
    id: 'game',
    title: '3D Game',
    icon: faCube,
    bgColor: '#4e5bb0',
    component: () => <div>3D Game component will go here</div>,
    defaultSize: { width: 1024, height: 768 }
  },
  {
    id: 'editor',
    title: 'Text Editor',
    icon: faFileLines,
    bgColor: '#69a1c5',
    component: () => <div>Text Editor component will go here</div>,
    defaultSize: { width: 700, height: 600 }
  },
  {
    id: 'gallery',
    title: 'Image Gallery',
    icon: faImages,
    bgColor: '#7e90c5',
    component: () => <div>Image Gallery component will go here</div>,
    defaultSize: { width: 900, height: 700 }
  },
  {
    id: 'music',
    title: 'Music Player',
    icon: faMusic,
    bgColor: '#a374c8',
    component: () => <div>Music Player component will go here</div>,
    defaultSize: { width: 400, height: 600 }
  },
  {
    id: 'messaging',
    title: 'Messaging',
    icon: faComments,
    bgColor: '#cf6394',
    component: () => <div>Messaging component will go here</div>,
    defaultSize: { width: 500, height: 700 }
  }
];

const StartMenu = ({ onClose }) => {
  const { openWindow, apps, registerApp } = useWindowManager();
  const [searchTerm, setSearchTerm] = React.useState('');
  const menuRef = useRef(null);
  
  // Register demo apps
  useEffect(() => {
    demoApps.forEach(app => {
      if (!apps.find(a => a.id === app.id)) {
        registerApp(app);
      }
    });
  }, [apps, registerApp]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  const handleAppClick = (app) => {
    openWindow(app);
    onClose();
  };
  
  const filteredApps = apps.filter(app => 
    app.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <MenuContainer ref={menuRef}>
      <MenuHeader>
        <SearchInput 
          type="text" 
          placeholder="Search apps..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </MenuHeader>
      <MenuList>
        {filteredApps.map(app => (
          <MenuItem 
            key={app.id} 
            onClick={() => handleAppClick(app)}
          >
            <AppIcon bgColor={app.bgColor}>
              {app.icon ? <FontAwesomeIcon icon={app.icon} /> : app.title.charAt(0)}
            </AppIcon>
            <AppName>{app.title}</AppName>
          </MenuItem>
        ))}
      </MenuList>
    </MenuContainer>
  );
};

export default StartMenu; 