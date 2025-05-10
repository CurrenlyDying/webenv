import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.isActive ? 'rgba(100, 100, 140, 0.5)' : 'transparent'};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  opacity: ${props => props.isMinimized ? 0.6 : 1};
  
  &:hover {
    background-color: rgba(80, 80, 120, 0.3);
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: ${props => props.isActive ? '16px' : props.isMinimized ? '8px' : '0'};
    height: 2px;
    background-color: white;
    border-radius: 1px;
    transition: width 0.2s;
  }
  
  &:hover::after {
    width: ${props => props.isActive ? '16px' : '8px'};
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.bgColor || 'transparent'};
  border-radius: ${props => props.bgColor ? '4px' : '0'};
  color: white;
  font-size: 14px;
`;

const DefaultIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #6e7bb8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const TaskbarIcon = ({ id, icon, title, isActive, isMinimized, onClick, bgColor }) => {
  // Get first letter for default icon
  const firstLetter = title ? title.charAt(0).toUpperCase() : 'A';
  
  return (
    <IconContainer 
      isActive={isActive} 
      isMinimized={isMinimized}
      onClick={onClick}
      title={title}
    >
      {icon ? (
        <IconWrapper bgColor={bgColor}>
          <FontAwesomeIcon icon={icon} />
        </IconWrapper>
      ) : (
        <DefaultIcon>{firstLetter}</DefaultIcon>
      )}
    </IconContainer>
  );
};

export default TaskbarIcon; 