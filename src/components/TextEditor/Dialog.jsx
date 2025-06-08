import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faFile, faFolder, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(3px);
`;

const DialogContainer = styled.div`
  background-color: rgba(35, 35, 45, 0.95);
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  width: 380px;
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  border: 1px solid rgba(100, 100, 120, 0.3);
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: rgba(60, 45, 90, 0.6);
  border-bottom: 1px solid rgba(100, 100, 120, 0.3);
`;

const DialogTitle = styled.div`
  color: #f0f0f0;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  color: #d0c5e0;
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.2);
    color: #fff;
  }
`;

const DialogContent = styled.div`
  padding: 16px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  color: #d0c5e0;
  font-size: 14px;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background-color: rgba(50, 40, 70, 0.6);
  border: 1px solid rgba(100, 100, 120, 0.3);
  border-radius: 6px;
  color: #f0f0f0;
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: rgba(255, 121, 198, 0.6);
    box-shadow: 0 0 0 2px rgba(255, 121, 198, 0.15);
  }
  
  &::placeholder {
    color: rgba(200, 200, 200, 0.3);
  }
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  gap: 8px;
  border-top: 1px solid rgba(100, 100, 120, 0.3);
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.primary ? `
    background-color: rgba(255, 121, 198, 0.7);
    color: white;
    
    &:hover {
      background-color: rgba(255, 121, 198, 0.9);
    }
  ` : `
    background-color: rgba(60, 50, 90, 0.7);
    color: #d0c5e0;
    
    &:hover {
      background-color: rgba(60, 50, 90, 0.9);
      color: white;
    }
  `}
`;

const ErrorMessage = styled.div`
  color: #ff6e6e;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Dialog = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  type = 'file', 
  onSubmit, 
  initialValue = '' 
}) => {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(initialValue);
      setError('');
    }
  }, [isOpen, initialValue]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      
      // Select filename without extension if there is a period
      const dotIndex = initialValue.lastIndexOf('.');
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isOpen, initialValue]);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !error) {
        handleSubmit();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, name, error]);
  
  const validateFileName = (fileName) => {
    if (!fileName.trim()) {
      return 'File name cannot be empty';
    }
    
    if (fileName.length > 255) {
      return 'File name is too long (max 255 characters)';
    }
    
    // Check for invalid characters based on type
    const invalidCharsRegex = type === 'file' 
      ? /[<>:"/\\|?*\x00-\x1F]/g 
      : /[<>:"/\\|?*\x00-\x1F]/g;
    
    if (invalidCharsRegex.test(fileName)) {
      return `${type === 'file' ? 'File' : 'Folder'} name contains invalid characters`;
    }
    
    // Specific checks for files
    if (type === 'file') {
      // Only suggest file extension rather than requiring it
      if (!fileName.startsWith('.') && !fileName.includes('.')) {
        console.warn('File without extension: ' + fileName);
        // Return warning instead of error to allow files without extensions
        // return 'File should have an extension (e.g. .txt, .md)';
      }
      
      // Check reserved names (for Windows compatibility)
      const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                           'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                           'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
      
      const baseName = fileName.split('.')[0].toUpperCase();
      if (reservedNames.includes(baseName)) {
        return `"${baseName}" is a reserved name`;
      }
    }
    
    return '';
  };
  
  const handleChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setError(validateFileName(newName));
  };
  
  const handleSubmit = () => {
    const validationError = validateFileName(name.trim());
    
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Call the onSubmit handler directly with the trimmed name
    if (name.trim() && !error) {
      // Safely call the onSubmit function
      try {
        onSubmit(name.trim());
        onClose();
      } catch (err) {
        console.error('Error submitting dialog:', err);
        setError('An error occurred while creating the file. Please try again.');
      }
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <DialogOverlay onClick={onClose}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <FontAwesomeIcon icon={icon || (type === 'file' ? faFile : faFolder)} />
            {title || (type === 'file' ? 'New File' : 'New Folder')}
          </DialogTitle>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </DialogHeader>
        
        <DialogContent>
          <InputGroup>
            <InputLabel>{type === 'file' ? 'File name:' : 'Folder name:'}</InputLabel>
            <Input
              ref={inputRef}
              type="text"
              value={name}
              onChange={handleChange}
              placeholder={type === 'file' ? 'Enter file name' : 'Enter folder name'}
              autoFocus
              style={{ borderColor: error ? 'rgba(255, 110, 110, 0.6)' : '' }}
            />
            {error && (
              <ErrorMessage>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </ErrorMessage>
            )}
          </InputGroup>
        </DialogContent>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            primary 
            onClick={handleSubmit} 
            disabled={!!error || !name.trim()}
            style={{ 
              opacity: (!!error || !name.trim()) ? '0.5' : '1',
              cursor: (!!error || !name.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faCheck} />
            Create
          </Button>
        </DialogFooter>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default Dialog; 