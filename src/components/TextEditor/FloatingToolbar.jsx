import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faFont,
  faLink,
  faHeading,
  faListUl,
  faListOl,
  faCode
} from '@fortawesome/free-solid-svg-icons';

const ToolbarContainer = styled.div`
  position: fixed;
  background-color: rgba(95, 75, 139, 0.95);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  padding: 6px;
  z-index: 1000;
  border: 1px solid rgba(255, 121, 198, 0.3);
  top: ${props => props.position.top}px;
  left: ${props => props.position.left}px;
  transform: translateX(-50%);
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 8px 8px 0;
    border-style: solid;
    border-color: rgba(95, 75, 139, 0.95) transparent transparent;
  }
`;

const ToolbarButton = styled.button`
  background-color: ${props => props.active ? 'rgba(255, 121, 198, 0.5)' : 'transparent'};
  color: white;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.3);
  }
  
  &:focus {
    outline: none;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
`;

const FontSizeSelect = styled.select`
  background-color: rgba(95, 75, 139, 0.7);
  color: white;
  border: 1px solid rgba(255, 121, 198, 0.3);
  border-radius: 4px;
  height: 28px;
  font-size: 12px;
  padding: 0 4px;
  margin: 0 4px;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 121, 198, 0.8);
  }
`;

const FontFamilySelect = styled.select`
  background-color: rgba(95, 75, 139, 0.7);
  color: white;
  border: 1px solid rgba(255, 121, 198, 0.3);
  border-radius: 4px;
  height: 28px;
  font-size: 12px;
  padding: 0 4px;
  margin: 0 4px;
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 121, 198, 0.8);
  }
`;

const FloatingToolbar = ({ position, onApplyStyle, currentStyle }) => {
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px'];
  const fontFamilies = [
    "'Monaco', 'Consolas', 'Courier New', monospace",
    "'Arial', sans-serif",
    "'Times New Roman', serif",
    "'Courier New', monospace",
    "'Georgia', serif"
  ];
  
  const handleFontFamilyChange = (e) => {
    onApplyStyle({ fontFamily: e.target.value });
  };
  
  const handleFontSizeChange = (e) => {
    onApplyStyle({ fontSize: e.target.value });
  };
  
  const handleBoldClick = () => {
    onApplyStyle({ fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' });
  };
  
  const handleItalicClick = () => {
    // In a real implementation, we would toggle font-style
    // For this demo, we're just toggling a class
    onApplyStyle({ fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' });
  };
  
  const handleTextAlignClick = (align) => {
    onApplyStyle({ textAlign: align });
  };
  
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      // In a real implementation, we would insert an actual link at the selection
      console.log('Insert link:', url);
    }
  };

  return (
    <ToolbarContainer position={position}>
      <FontFamilySelect value={currentStyle.fontFamily} onChange={handleFontFamilyChange}>
        <option value="'Monaco', 'Consolas', 'Courier New', monospace">Monaco</option>
        <option value="'Arial', sans-serif">Arial</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="'Georgia', serif">Georgia</option>
      </FontFamilySelect>
      
      <FontSizeSelect value={currentStyle.fontSize} onChange={handleFontSizeChange}>
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </FontSizeSelect>
      
      <Divider />
      
      <ToolbarButton 
        active={currentStyle.fontWeight === 'bold'} 
        onClick={handleBoldClick}
        title="Bold"
      >
        <FontAwesomeIcon icon={faBold} />
      </ToolbarButton>
      
      <ToolbarButton 
        active={currentStyle.fontStyle === 'italic'} 
        onClick={handleItalicClick}
        title="Italic"
      >
        <FontAwesomeIcon icon={faItalic} />
      </ToolbarButton>
      
      <ToolbarButton title="Underline">
        <FontAwesomeIcon icon={faUnderline} />
      </ToolbarButton>
      
      <Divider />
      
      <ToolbarButton 
        active={currentStyle.textAlign === 'left'}
        onClick={() => handleTextAlignClick('left')}
        title="Align Left"
      >
        <FontAwesomeIcon icon={faAlignLeft} />
      </ToolbarButton>
      
      <ToolbarButton 
        active={currentStyle.textAlign === 'center'}
        onClick={() => handleTextAlignClick('center')}
        title="Align Center"
      >
        <FontAwesomeIcon icon={faAlignCenter} />
      </ToolbarButton>
      
      <ToolbarButton 
        active={currentStyle.textAlign === 'right'}
        onClick={() => handleTextAlignClick('right')}
        title="Align Right"
      >
        <FontAwesomeIcon icon={faAlignRight} />
      </ToolbarButton>
      
      <Divider />
      
      <ToolbarButton onClick={insertLink} title="Insert Link">
        <FontAwesomeIcon icon={faLink} />
      </ToolbarButton>
      
      <ToolbarButton title="Code">
        <FontAwesomeIcon icon={faCode} />
      </ToolbarButton>
    </ToolbarContainer>
  );
};

export default FloatingToolbar; 