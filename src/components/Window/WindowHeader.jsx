import React from 'react';
import styled from 'styled-components';
import { useWindowManager } from '../../hooks/useWindowManager.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(35, 35, 45, 0.8);
  backdrop-filter: blur(5px);
  height: 36px;
  user-select: none;
  cursor: move;
`;

const IconWrapper = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Title = styled.div`
  flex: 1;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Controls = styled.div`
  display: flex;
  gap: 6px;
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: ${props => props.bgColor};
  color: transparent;
  font-size: 10px;
  line-height: 1;
  padding: 0;
  transition: all 0.2s;
  
  &:hover {
    color: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
  }
  
  &:focus {
    outline: none;
  }
`;

const MinimizeButton = styled(ControlButton)`
  background-color: #f7ca4d;
  &:hover {
    background-color: #f9d675;
  }
`;

const CloseButton = styled(ControlButton)`
  background-color: #fc615d;
  &:hover {
    background-color: #fd827f;
  }
`;

const WindowHeader = ({ id, title, icon }) => {
  const { minimizeWindow, closeWindow } = useWindowManager();

  return (
    <Header className="window-drag-handle">
      {icon && (
        <IconWrapper>
          {typeof icon === 'object' ? (
            <FontAwesomeIcon icon={icon} />
          ) : (
            <img src={icon} alt={title} style={{ width: '100%', height: '100%' }} />
          )}
        </IconWrapper>
      )}
      <Title>{title}</Title>
      <Controls>
        <MinimizeButton 
          bgColor="#f7ca4d" 
          onClick={(e) => {
            e.stopPropagation();
            minimizeWindow(id);
          }} 
          title="Minimize"
        >
          -
        </MinimizeButton>
        <CloseButton 
          bgColor="#fc615d" 
          onClick={(e) => {
            e.stopPropagation();
            closeWindow(id);
          }} 
          title="Close"
        >
          ×
        </CloseButton>
      </Controls>
    </Header>
  );
};

export default WindowHeader; 