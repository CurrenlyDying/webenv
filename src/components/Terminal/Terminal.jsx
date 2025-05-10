import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useFileSystem } from '../../hooks/useFileSystem';

const TerminalContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: #12141c;
  color: #f0f0f0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  padding: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const TerminalOutput = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  white-space: pre-wrap;
  
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

const TerminalInput = styled.div`
  display: flex;
  padding: 8px;
`;

const Prompt = styled.span`
  color: #6e7bb8;
  margin-right: 8px;
`;

const Input = styled.input`
  background-color: transparent;
  border: none;
  color: #f0f0f0;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  flex: 1;
  
  &:focus {
    outline: none;
  }
`;

const Terminal = ({ id }) => {
  const [history, setHistory] = useState([{ text: 'Welcome to PutEnv Terminal v1.0.0', type: 'system' }]);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  
  const { 
    currentDirectory,
    fileSystem,
    executeCommand,
  } = useFileSystem();

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Scroll to bottom when history changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const command = inputValue.trim();
      
      // Add command to history
      setHistory(prev => [
        ...prev, 
        { text: `${currentDirectory}> ${command}`, type: 'command' }
      ]);
      
      // Execute command and get result
      const result = executeCommand(command);
      
      // Add result to history if not empty
      if (result) {
        setHistory(prev => [...prev, { text: result, type: 'output' }]);
      }
      
      // Add to command history
      setCommandHistory(prev => [command, ...prev].slice(0, 100));
      setHistoryIndex(-1);
      setInputValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputValue('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion will be implemented in the useFileSystem hook
    }
  };
  
  // Click handler to focus input
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <TerminalContainer onClick={handleContainerClick}>
      <TerminalOutput ref={outputRef}>
        {history.map((entry, index) => (
          <div key={index} style={{ color: entry.type === 'system' ? '#6e9cb8' : '#f0f0f0' }}>
            {entry.text}
          </div>
        ))}
      </TerminalOutput>
      <TerminalInput>
        <Prompt>{currentDirectory}&gt;</Prompt>
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck="false"
        />
      </TerminalInput>
    </TerminalContainer>
  );
};

export default Terminal; 