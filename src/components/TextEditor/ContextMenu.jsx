import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCut,
  faCopy,
  faPaste,
  faUndo,
  faRedo,
  faAlignLeft,
  faFont,
  faSave,
  faFileExport,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

const MenuContainer = styled.div`
  position: fixed;
  background-color: rgba(60, 45, 90, 0.95);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  border: 1px solid rgba(255, 121, 198, 0.3);
  overflow: hidden;
  min-width: 180px;
  top: ${props => props.position.y}px;
  left: ${props => props.position.x}px;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  color: white;
  font-size: 13px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.2);
  }
  
  ${props => props.disabled && `
    opacity: 0.5;
    cursor: default;
    &:hover {
      background-color: transparent;
    }
  `}
`;

const MenuIcon = styled.span`
  margin-right: 8px;
  width: 16px;
  display: flex;
  justify-content: center;
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
`;

const Shortcut = styled.span`
  margin-left: auto;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-align: right;
`;

const ContextMenu = ({ position, onClose, onAction, hasSelection }) => {
  const menuRef = useRef(null);
  
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
  
  const handleAction = (action) => {
    onAction(action);
    onClose();
  };
  
  return (
    <MenuContainer position={position} ref={menuRef}>
      <MenuItem 
        onClick={() => handleAction('cut')} 
        disabled={!hasSelection}
      >
        <MenuIcon><FontAwesomeIcon icon={faCut} /></MenuIcon>
        Cut
        <Shortcut>Ctrl+X</Shortcut>
      </MenuItem>
      
      <MenuItem 
        onClick={() => handleAction('copy')} 
        disabled={!hasSelection}
      >
        <MenuIcon><FontAwesomeIcon icon={faCopy} /></MenuIcon>
        Copy
        <Shortcut>Ctrl+C</Shortcut>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('paste')}>
        <MenuIcon><FontAwesomeIcon icon={faPaste} /></MenuIcon>
        Paste
        <Shortcut>Ctrl+V</Shortcut>
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem onClick={() => handleAction('undo')}>
        <MenuIcon><FontAwesomeIcon icon={faUndo} /></MenuIcon>
        Undo
        <Shortcut>Ctrl+Z</Shortcut>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('redo')}>
        <MenuIcon><FontAwesomeIcon icon={faRedo} /></MenuIcon>
        Redo
        <Shortcut>Ctrl+Y</Shortcut>
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem onClick={() => handleAction('format')}>
        <MenuIcon><FontAwesomeIcon icon={faFont} /></MenuIcon>
        Format Text
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('align')}>
        <MenuIcon><FontAwesomeIcon icon={faAlignLeft} /></MenuIcon>
        Paragraph
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem onClick={() => handleAction('save')}>
        <MenuIcon><FontAwesomeIcon icon={faSave} /></MenuIcon>
        Save
        <Shortcut>Ctrl+S</Shortcut>
      </MenuItem>
      
      <MenuItem onClick={() => handleAction('export')}>
        <MenuIcon><FontAwesomeIcon icon={faFileExport} /></MenuIcon>
        Export
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem onClick={() => handleAction('clear')}>
        <MenuIcon><FontAwesomeIcon icon={faTrash} /></MenuIcon>
        Clear All
      </MenuItem>
    </MenuContainer>
  );
};

export default ContextMenu; 