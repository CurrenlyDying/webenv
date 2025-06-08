import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { marked } from 'marked';
import FloatingToolbar from './FloatingToolbar';
import ContextMenu from './ContextMenu';
import FileExplorer from './FileExplorer';
import Dialog from './Dialog';
import { useFileSystem } from '../../hooks/useFileSystem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faSave, faPlus, faFileExport, faFile } from '@fortawesome/free-solid-svg-icons';

const EditorContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2a1e3d;
  color: #f0f0f0;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  position: relative;
`;

const EditorHeader = styled.div`
  background-color: #3a2a4d;
  padding: 6px 12px;
  font-size: 12px;
  color: #d0c5e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #4b3b5d;
`;

const EditorContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
`;

const EditorWorkspace = styled.div`
  flex: 1;
  position: relative;
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2a1e3d;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #4b3b5d;
    border-radius: 4px;
  }
`;

const EditorToolbar = styled.div`
  padding: 4px 12px;
  background-color: #3a2a4d;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #4b3b5d;
`;

const ToolbarButton = styled.button`
  background-color: transparent;
  border: none;
  color: #d0c5e0;
  padding: 4px 8px;
  font-size: 13px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.2);
  }
  
  ${props => props.active && `
    background-color: rgba(255, 121, 198, 0.3);
  `}
`;

const LineNumbers = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background-color: #2a1e3d;
  border-right: 1px solid #4b3b5d;
  text-align: right;
  padding: 5px 0;
  font-size: 12px;
  color: #8b7fa0;
  user-select: none;
  overflow: hidden;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
`;

const TextArea = styled.div`
  position: absolute;
  left: 40px;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  white-space: pre-wrap;
  outline: none;
  direction: ltr;
  font-size: ${props => props.fontSize || '14px'};
  font-family: ${props => props.fontFamily || "'Monaco', 'Consolas', 'Courier New', monospace"};
  font-weight: ${props => props.fontWeight || 'normal'};
  text-align: ${props => props.textAlign || 'left'};
  color: #f0f0f0;
  caret-color: #ff79c6;
  overflow: auto;
  line-height: 1.5;
  box-sizing: border-box;
  min-height: 100%;
  tab-size: 2;
  -moz-tab-size: 2;
  letter-spacing: 0;
  padding-top: 5px; /* Consistent top padding */
`;

const StatusBar = styled.div`
  background-color: #3a2a4d;
  padding: 4px 12px;
  font-size: 12px;
  color: #d0c5e0;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #4b3b5d;
`;

const MarkdownPreview = styled.div`
  position: absolute;
  left: 40px;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 5px;
  overflow: auto;
  font-size: ${props => props.fontSize || '14px'};
  font-family: ${props => props.fontFamily || "'Arial', sans-serif"};
  color: #f0f0f0;
  
  h1, h2, h3, h4, h5, h6 {
    color: #ff79c6;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  
  a {
    color: #bd93f9;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  p {
    margin-bottom: 1em;
  }
  
  code {
    background-color: rgba(80, 60, 120, 0.3);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  }
  
  pre {
    background-color: rgba(80, 60, 120, 0.3);
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
    margin: 1em 0;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  ul, ol {
    margin-left: 2em;
    margin-bottom: 1em;
  }
  
  blockquote {
    border-left: 4px solid #bd93f9;
    padding-left: 1em;
    margin-left: 0;
    color: #d0c5e0;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    
    th, td {
      border: 1px solid #4b3b5d;
      padding: 0.5em;
    }
    
    th {
      background-color: rgba(80, 60, 120, 0.3);
    }
  }
  
  img {
    max-width: 100%;
  }
`;

const EditorModeSwitch = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const ModeButton = styled.button`
  background-color: ${props => props.active ? 'rgba(255, 121, 198, 0.3)' : 'transparent'};
  color: #d0c5e0;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.2);
  }
`;

const TextEditor = ({ id, filePath }) => {
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState(null);
  const [textStyle, setTextStyle] = useState({
    fontFamily: "'Monaco', 'Consolas', 'Courier New', monospace",
    fontSize: '14px',
    fontWeight: 'normal',
    textAlign: 'left'
  });
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [currentFilePath, setCurrentFilePath] = useState(filePath || '/home/user/documents/README.md');
  const [isModified, setIsModified] = useState(false);
  const [fileHistory, setFileHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' or 'preview'
  const [showExplorer, setShowExplorer] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('file'); // 'file' or 'directory'
  const [dialogParentPath, setDialogParentPath] = useState('/home/user/documents');
  
  const textAreaRef = useRef(null);
  const { 
    getNodeAtPath, 
    setFileSystem, 
    resolvePath, 
    fileSystem,
    saveFileToCookie,
    getFileFromCookie
  } = useFileSystem();
  
  // Create a version of saveFile that uses cookies for user files
  const saveFileTo = useCallback((path, contentToSave) => {
    try {
      const resolvedPath = resolvePath(path);
      const parentPath = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
      const fileName = resolvedPath.split('/').pop();
      
      // Special handling for README.md - don't modify it
      if (resolvedPath === '/home/user/documents/README.md') {
        console.log('README.md is read-only and cannot be modified');
        return false;
      }
      
      // Create parent directories if they don't exist
      setFileSystem(prevFs => {
        const newFs = JSON.parse(JSON.stringify(prevFs));
        let current = newFs['/'];
        
        if (parentPath !== '/') {
          const parts = parentPath.split('/').filter(Boolean);
          for (const part of parts) {
            if (!current.contents[part]) {
              current.contents[part] = {
                type: 'directory',
                contents: {},
              };
            }
            current = current.contents[part];
          }
        }
        
        current.contents[fileName] = {
          type: 'file',
          content: contentToSave,
          size: contentToSave.length,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        };
        
        return newFs;
      });
      
      // Save user file to cookie for persistence
      saveFileToCookie(resolvedPath, contentToSave);
      
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  }, [resolvePath, setFileSystem, saveFileToCookie]);
  
  // Use saveFileTo in the loadFile function
  const loadFile = useCallback((path) => {
    try {
      const resolvedPath = resolvePath(path);
      
      // Special handling for README.md to ensure it always loads
      if (resolvedPath.toLowerCase() === '/home/user/documents/readme.md') {
        // Get the README.md from the initial file system
        const node = fileSystem['/']?.contents?.home?.contents?.user?.contents?.documents?.contents?.['README.md'];
        
        if (node && node.type === 'file') {
          setContent(node.content || '');
          setCurrentFilePath(resolvedPath);
          setIsModified(false);
          
          // Initialize file history for README
          setFileHistory([node.content || '']);
          setHistoryIndex(0);
          return true;
        }
      }
      
      // For other files, check file system first
      const { node } = getNodeAtPath(resolvedPath);
      
      if (node && node.type === 'file') {
        // Successfully found the file in the file system
        setContent(node.content || '');
        setCurrentFilePath(resolvedPath);
        setIsModified(false);
        
        // Initialize file history
        setFileHistory([node.content || '']);
        setHistoryIndex(0);
        return true;
      } else {
        // Try loading from cookie if not in file system
        const cookieContent = getFileFromCookie(resolvedPath);
        if (cookieContent) {
          // Create the file in the file system and set content
          saveFileTo(resolvedPath, cookieContent);
          setContent(cookieContent);
          setCurrentFilePath(resolvedPath);
          setIsModified(false);
          
          // Initialize file history
          setFileHistory([cookieContent]);
          setHistoryIndex(0);
          return true;
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error loading file:', error);
      return false;
    }
  }, [fileSystem, getNodeAtPath, getFileFromCookie, resolvePath, saveFileTo]);
  
  // Main saveFile function that uses saveFileTo
  const saveFile = useCallback(() => {
    if (!currentFilePath) return false;
    
    // Prevent saving the README.md file
    if (currentFilePath === '/home/user/documents/README.md') {
      console.log('Cannot save changes to README.md as it is read-only');
      // Reload the original README content
      loadFile('/home/user/documents/README.md');
      return false;
    }
    
    const result = saveFileTo(currentFilePath, content);
    if (result) {
      setIsModified(false);
    }
    return result;
  }, [content, currentFilePath, saveFileTo, loadFile]);
  
  // Use the regular loadFile in the useEffect
  useEffect(() => {
    if (currentFilePath) {
      const success = loadFile(currentFilePath);
      if (!success) {
        // If loading fails, show error message
        setContent('# Error loading file\n\nThe requested file could not be loaded. It may not exist or is inaccessible.');
      }
    }
  }, [currentFilePath, loadFile]);
  
  // Initialize with README.md on first mount
  useEffect(() => {
    // Load README.md by default when the component first mounts
    if (currentFilePath === '/home/user/documents/README.md') {
      loadFile(currentFilePath);
    }
  }, []);
  
  const handleTextChange = (e) => {
    // Preserve the selection and cursor position
    const selection = window.getSelection();
    const hadSelection = selection.rangeCount > 0;
    const isCollapsed = hadSelection ? selection.getRangeAt(0).collapsed : true;
    
    // Get content directly from the event target
    const newContent = e.target.innerText;
    
    // Don't manipulate the DOM if not needed
    if (content === newContent) return;
    
    // Get the exact text node and offset before we make any state changes
    let selectionStart = 0;
    let selectionEnd = 0;
    
    if (hadSelection) {
      const range = selection.getRangeAt(0);
      
      // Save selection information
      selectionStart = getTextOffsetInElement(textAreaRef.current, range.startContainer, range.startOffset);
      selectionEnd = isCollapsed ? selectionStart : getTextOffsetInElement(textAreaRef.current, range.endContainer, range.endOffset);
    }
    
    // Force re-render of line numbers when content changes
    const oldLines = content.split('\n').length;
    const newLines = newContent.split('\n').length;
    const lineNumbersChanged = oldLines !== newLines;
    
    // Check if trying to edit README.md
    if (currentFilePath === '/home/user/documents/README.md') {
      // Allow viewing but reset content on edit attempts
      if (newContent !== content) {
        const readOnlyMessage = `## Note: This README file is read-only
        
The content above cannot be modified. To create a new file, use the "New" button in the toolbar.`;
        
        // We'll allow them to see changes temporarily but reload on save
        setIsModified(true);
        
        // Show a temporary warning if they try to edit
        if (!isModified) {
          alert('The README file is read-only. To save changes, please create a new file.');
        }
      }
    }
    
    // Update state with new content
    setContent(newContent);
    setIsModified(true);
    
    // Calculate line and column for status bar
    if (hadSelection) {
      const contentBeforeCursor = newContent.substring(0, selectionStart);
      const lines = contentBeforeCursor.split('\n');
      setCursorPosition({
        line: lines.length,
        column: lines[lines.length - 1].length + 1
      });
    }
    
    // Set a flag to restore selection in the next render cycle
    if (hadSelection) {
      // We'll use requestAnimationFrame for better timing than setTimeout
      requestAnimationFrame(() => {
        restoreSelection(textAreaRef.current, selectionStart, selectionEnd);
      });
    }
  };
  
  // Helper function to calculate absolute text offset within an element
  const getTextOffsetInElement = (rootElement, targetNode, targetOffset) => {
    // Handle case when selection is not in our editor
    if (!rootElement.contains(targetNode)) return 0;
    
    // Function to recursively get text before a specific node
    const getTextBeforeNode = (root, target) => {
      if (root === target) return '';
      
      let text = '';
      const childNodes = root.childNodes;
      
      for (let i = 0; i < childNodes.length; i++) {
        const child = childNodes[i];
        
        if (child === target) {
          return text;
        }
        
        if (child.contains(target)) {
          return text + getTextBeforeNode(child, target);
        }
        
        if (child.nodeType === Node.TEXT_NODE) {
          text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          // For non-text nodes, add their text content
          text += child.textContent;
          
          // Handle special cases that might affect text counting
          if (requiresExtraNewline(child)) {
            text += '\n';
          }
        }
      }
      
      return text;
    };
    
    // For text nodes, calculate the text offset
    if (targetNode.nodeType === Node.TEXT_NODE) {
      const textBeforeNode = getTextBeforeNode(rootElement, targetNode);
      return textBeforeNode.length + targetOffset;
    }
    
    // For element nodes
    if (targetNode.nodeType === Node.ELEMENT_NODE) {
      let offset = 0;
      
      for (let i = 0; i < targetOffset; i++) {
        if (i < targetNode.childNodes.length) {
          const child = targetNode.childNodes[i];
          if (child.nodeType === Node.TEXT_NODE) {
            offset += child.textContent.length;
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            offset += child.textContent.length;
            if (requiresExtraNewline(child)) {
              offset += 1;
            }
          }
        }
      }
      
      return offset;
    }
    
    return 0;
  };
  
  // Helper function to determine if an element causes additional new lines
  const requiresExtraNewline = (element) => {
    const style = window.getComputedStyle(element);
    return style.display === 'block' || style.display === 'list-item' || 
           element.tagName === 'BR' || element.tagName === 'P' || 
           element.tagName === 'DIV';
  };
  
  // Helper function to restore selection
  const restoreSelection = (rootElement, selectionStart, selectionEnd) => {
    if (!rootElement) return;
    
    try {
      // We need to find the text node and offset corresponding to the absolute position
      const nodeAndOffset = findNodeAndOffsetAtPosition(rootElement, selectionStart);
      const endNodeAndOffset = selectionStart === selectionEnd 
                            ? nodeAndOffset 
                            : findNodeAndOffsetAtPosition(rootElement, selectionEnd);
                            
      if (!nodeAndOffset || !endNodeAndOffset) return;
      
      // Create and set the selection range
      const range = document.createRange();
      range.setStart(nodeAndOffset.node, nodeAndOffset.offset);
      range.setEnd(endNodeAndOffset.node, endNodeAndOffset.offset);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Make sure the cursor is visible
      if (selectionStart === selectionEnd) {
        const rect = range.getBoundingClientRect();
        if (rect) {
          rootElement.scrollIntoView({ block: 'nearest' });
        }
      }
    } catch (error) {
      console.error("Error restoring selection:", error);
    }
  };
  
  // Helper function to find node and offset at absolute position
  const findNodeAndOffsetAtPosition = (rootElement, position) => {
    if (position < 0) return null;
    
    // Handle empty content
    if (!rootElement.hasChildNodes()) {
      rootElement.appendChild(document.createTextNode(''));
      return { node: rootElement.firstChild, offset: 0 };
    }
    
    // Function to find the text node and offset
    const findTextNodeAtPosition = (node, currentPos) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeLength = node.textContent.length;
        if (currentPos <= nodeLength) {
          return { 
            node: node,
            offset: currentPos
          };
        } else {
          return { 
            node: null, 
            offset: currentPos - nodeLength 
          };
        }
      }
      
      if (!node.hasChildNodes()) {
        return { node: node, offset: 0 };
      }
      
      let currentOffset = currentPos;
      
      for (let i = 0; i < node.childNodes.length; i++) {
        const childNode = node.childNodes[i];
        const result = findTextNodeAtPosition(childNode, currentOffset);
        
        if (result.node) {
          return result;
        }
        
        // Move past this node
        currentOffset = result.offset;
        
        // Handle special cases that might add an additional newline
        if (requiresExtraNewline(childNode)) {
          currentOffset -= 1; // Adjust for the newline we count
        }
      }
      
      // If we reach here, we've gone through all child nodes but haven't found
      // the right position. If the position is just after all text, return the last node.
      if (currentOffset === 0 && node.lastChild) {
        const lastChild = node.lastChild;
        if (lastChild.nodeType === Node.TEXT_NODE) {
          return { node: lastChild, offset: lastChild.textContent.length };
        } else {
          return { node: node, offset: node.childNodes.length };
        }
      }
      
      return { node: null, offset: currentOffset };
    };
    
    const result = findTextNodeAtPosition(rootElement, position);
    
    // If we didn't find the right node, try to position at the end
    if (!result.node && position > 0) {
      // Try to find the last text node and place cursor at its end
      const textNodes = [];
      const findAllTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node);
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            findAllTextNodes(node.childNodes[i]);
          }
        }
      };
      
      findAllTextNodes(rootElement);
      
      if (textNodes.length > 0) {
        const lastTextNode = textNodes[textNodes.length - 1];
        return { node: lastTextNode, offset: lastTextNode.textContent.length };
      }
      
      // If no text nodes, place at the end of the container
      return { node: rootElement, offset: rootElement.childNodes.length };
    }
    
    return result;
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Insert a single newline character
      document.execCommand('insertText', false, '\n');
      return;
    }
    
    // Handle other special keys (like Tab)
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveFile();
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      undo();
    } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      redo();
    }
  };
  
  const handleTextSelect = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const rects = range.getClientRects();
        if (rects.length > 0) {
          // Position toolbar above the selection
          const rect = rects[0];
          setToolbarPosition({
            top: rect.top - 50,
            left: rect.left + (rect.width / 2) - 100
          });
          setShowToolbar(true);
          setSelection({
            text: selection.toString(),
            range: range.cloneRange()
          });
        }
      } else {
        setShowToolbar(false);
      }
    }
  };
  
  const handleTextClick = () => {
    // Hide toolbar when clicking elsewhere
    setShowToolbar(false);
  };
  
  const getLineNumbers = () => {
    // Default to showing at least one line
    if (!content) {
      return <div style={{ padding: '0 8px', lineHeight: '1.5' }}>1</div>;
    }
    
    // Count lines, including handling trailing newline correctly
    const linesArray = content.split('\n');
    
    // Return line numbers with consistent styling
    return linesArray.map((_, idx) => (
      <div 
        key={idx} 
        style={{ 
          padding: '0 8px',
          lineHeight: '1.5',
          height: '1.5em',
          boxSizing: 'border-box',
        }}
      >
        {idx + 1}
      </div>
    ));
  };
  
  // Simplified effect to just apply essential styles
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.lineHeight = '1.5';
      textAreaRef.current.style.whiteSpace = 'pre-wrap';
      textAreaRef.current.style.overflowWrap = 'break-word';
    }
  }, []);
  
  // Apply text style to selected text
  const applyStyle = (styleUpdate) => {
    if (!selection) return;
    
    setTextStyle(prev => ({ ...prev, ...styleUpdate }));
    
    // In a real implementation, we would apply the style to the selected text only
    // For this demo, we're applying it to the entire editor for simplicity
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Position context menu at cursor
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    
    setShowContextMenu(true);
  };
  
  const handleContextMenuAction = (action) => {
    switch (action) {
      case 'cut':
        document.execCommand('cut');
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
      case 'save':
        saveFile();
        break;
      case 'format':
        setShowToolbar(true);
        break;
      case 'clear':
        if (window.confirm('Are you sure you want to clear all content?')) {
          setContent('');
          setIsModified(true);
        }
        break;
      case 'export':
        // Create a download link for the file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFilePath.split('/').pop() || 'document.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      default:
        break;
    }
  };
  
  // Add undo/redo functionality
  useEffect(() => {
    if (isModified && content !== undefined && historyIndex >= 0 && fileHistory.length > 0 && content !== fileHistory[historyIndex]) {
      // Add to history
      const newHistory = fileHistory.slice(0, historyIndex + 1);
      newHistory.push(content);
      setFileHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else if (isModified && (fileHistory.length === 0 || historyIndex < 0)) {
      // Initialize history
      setFileHistory([content]);
      setHistoryIndex(0);
    }
  }, [content, isModified]);
  
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(fileHistory[historyIndex - 1]);
    }
  };
  
  const redo = () => {
    if (historyIndex < fileHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(fileHistory[historyIndex + 1]);
    }
  };
  
  // Convert markdown content to HTML for preview
  const renderMarkdown = () => {
    try {
      // Ensure content is a string before passing to marked
      const safeContent = typeof content === 'string' ? content : '';
      return { __html: marked(safeContent) };
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return { __html: '<p>Error rendering markdown</p>' };
    }
  };
  
  // Determine if the file is markdown
  const isMarkdownFile = () => {
    return currentFilePath.toLowerCase().endsWith('.md');
  };
  
  const handleFileClick = (path) => {
    if (isModified) {
      const confirmSave = window.confirm('You have unsaved changes. Save before opening a new file?');
      if (confirmSave) {
        saveFile();
      }
    }
    
    setCurrentFilePath(path);
    loadFile(path);
  };
  
  const createNewFile = (path) => {
    try {
      // Ensure path is valid
      if (!path || typeof path !== 'string') {
        console.error('Invalid path provided:', path);
        throw new Error('Invalid file path');
      }

      setFileSystem(prevFs => {
        try {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
          const fileName = path.split('/').pop();
          
          if (!fileName) {
            console.error('Invalid filename in path:', path);
            return prevFs; // Return unchanged if filename is invalid
          }
          
          let current = newFs['/'];
          
          if (parentPath !== '/') {
            const parts = parentPath.split('/').filter(Boolean);
            
            // Ensure all directories in the path exist
            for (const part of parts) {
              if (!current.contents[part]) {
                // Create missing directory
                console.log(`Creating missing directory: ${part} in path ${parentPath}`);
                current.contents[part] = {
                  type: 'directory',
                  contents: {},
                };
              }
              
              if (!current.contents[part].contents) {
                current.contents[part].contents = {};
              }
              
              current = current.contents[part];
            }
          }
          
          if (!current.contents) {
            current.contents = {};
          }
          
          current.contents[fileName] = {
            type: 'file',
            content: '',
            size: 0,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
          };
          
          return newFs;
        } catch (err) {
          console.error('Error updating file system for file creation:', err);
          return prevFs; // Return unchanged on error
        }
      });
      
      // Open the newly created file
      setCurrentFilePath(path);
      setContent('');
      setIsModified(false);
      
      return true;
    } catch (error) {
      console.error('Error in createNewFile:', error);
      throw new Error('Failed to create file: ' + (error.message || 'Unknown error'));
    }
  };
  
  const createNewDirectory = (path) => {
    try {
      if (!path || typeof path !== 'string') {
        console.error('Invalid path provided:', path);
        throw new Error('Invalid directory path');
      }
      
      const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
      const dirName = path.split('/').pop();
      
      if (!dirName) {
        console.error('Invalid directory name in path:', path);
        throw new Error('Invalid directory name');
      }
      
      setFileSystem(prevFs => {
        try {
          const newFs = JSON.parse(JSON.stringify(prevFs));
          let current = newFs['/'];
          
          if (parentPath !== '/') {
            const parts = parentPath.split('/').filter(Boolean);
            
            // Ensure all parent directories in the path exist
            for (const part of parts) {
              if (!current.contents[part]) {
                // Create missing directory
                console.log(`Creating missing parent directory: ${part} in path ${parentPath}`);
                current.contents[part] = {
                  type: 'directory',
                  contents: {},
                };
              }
              
              if (!current.contents[part].contents) {
                current.contents[part].contents = {};
              }
              
              current = current.contents[part];
            }
          }
          
          if (!current.contents) {
            current.contents = {};
          }
          
          current.contents[dirName] = {
            type: 'directory',
            contents: {},
          };
          
          return newFs;
        } catch (err) {
          console.error('Error updating file system for directory creation:', err);
          return prevFs; // Return unchanged on error
        }
      });
    } catch (error) {
      console.error('Error in createNewDirectory:', error);
      throw new Error('Failed to create directory: ' + (error.message || 'Unknown error'));
    }
  };
  
  const toggleExplorer = () => {
    setShowExplorer(!showExplorer);
  };
  
  const createNewFilePrompt = () => {
    setDialogType('file');
    setDialogParentPath('/home/user/documents');
    setShowDialog(true);
  };
  
  const createNewDirectoryPrompt = () => {
    setDialogType('directory');
    setDialogParentPath('/home/user/documents');
    setShowDialog(true);
  };
  
  const handleDialogSubmit = (name) => {
    try {
      console.log(`Creating ${dialogType} with name: "${name}" in path: "${dialogParentPath}"`);
      
      // Make sure the name isn't empty
      if (!name || !name.trim()) {
        console.error('Cannot create with empty name');
        throw new Error('Name cannot be empty');
      }
      
      // Make sure the path doesn't have double slashes
      const cleanPath = `${dialogParentPath}/${name}`.replace(/\/+/g, '/');
      
      console.log(`Full path for new ${dialogType}: "${cleanPath}"`);
      
      if (dialogType === 'file') {
        createNewFile(cleanPath);
      } else {
        createNewDirectory(cleanPath);
      }
      
      console.log(`Successfully created ${dialogType}: ${cleanPath}`);
    } catch (error) {
      console.error(`Error creating ${dialogType}:`, error);
      throw error; // Re-throw to allow Dialog component to catch it
    }
  };
  
  const exportFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilePath.split('/').pop() || 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Add paste event handler to ensure consistent newline handling
  const handlePaste = (e) => {
    e.preventDefault();
    
    // Get the clipboard text
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');
    
    if (!pastedText) return;
    
    // Normalize newlines to ensure consistent behavior
    const normalizedText = pastedText.replace(/\r\n/g, '\n');
    
    // Use execCommand for consistent behavior with manual newline insertion
    document.execCommand('insertText', false, normalizedText);
  };
  
  return (
    <EditorContainer>
      <EditorHeader>
        {currentFilePath} {isModified ? '(modified)' : ''}
        
        {isMarkdownFile() && (
          <EditorModeSwitch>
            <ModeButton 
              active={editorMode === 'edit'} 
              onClick={() => setEditorMode('edit')}
            >
              Edit
            </ModeButton>
            <ModeButton 
              active={editorMode === 'preview'} 
              onClick={() => setEditorMode('preview')}
            >
              Preview
            </ModeButton>
          </EditorModeSwitch>
        )}
      </EditorHeader>
      
      <EditorToolbar>
        <ToolbarButton onClick={toggleExplorer} active={showExplorer} title="Toggle Explorer">
          <FontAwesomeIcon icon={faFolder} /> Explorer
        </ToolbarButton>
        
        <ToolbarButton onClick={saveFile} title="Save (Ctrl+S)">
          <FontAwesomeIcon icon={faSave} /> Save
        </ToolbarButton>
        
        <ToolbarButton onClick={createNewFilePrompt} title="New File">
          <FontAwesomeIcon icon={faPlus} /> New
        </ToolbarButton>
        
        <ToolbarButton onClick={exportFile} title="Export File">
          <FontAwesomeIcon icon={faFileExport} /> Export
        </ToolbarButton>
      </EditorToolbar>
      
      <EditorContent>
        {showExplorer && (
          <FileExplorer
            fileSystem={fileSystem}
            onFileClick={handleFileClick}
            currentFilePath={currentFilePath}
            onCreateFile={(path) => {
              setDialogType('file');
              setDialogParentPath(path.substring(0, path.lastIndexOf('/')) || '/');
              setShowDialog(true);
            }}
            onCreateDirectory={(path) => {
              setDialogType('directory');
              setDialogParentPath(path.substring(0, path.lastIndexOf('/')) || '/');
              setShowDialog(true);
            }}
          />
        )}
        
        <EditorWorkspace>
          <LineNumbers>
            {getLineNumbers()}
          </LineNumbers>
          
          {editorMode === 'edit' ? (
            <TextArea
              ref={textAreaRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTextChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onMouseUp={handleTextSelect}
              onClick={handleTextClick}
              onContextMenu={handleContextMenu}
              onBlur={() => setShowToolbar(false)}
              fontFamily={textStyle.fontFamily}
              fontSize={textStyle.fontSize}
              fontWeight={textStyle.fontWeight}
              textAlign={textStyle.textAlign}
              style={{ 
                left: 40, 
                direction: 'ltr', 
                unicodeBidi: 'normal',
              }}
            >
              {content}
            </TextArea>
          ) : (
            <MarkdownPreview
              dangerouslySetInnerHTML={renderMarkdown()}
              fontSize={textStyle.fontSize}
            />
          )}
        </EditorWorkspace>
        
        {showToolbar && (
          <FloatingToolbar
            position={toolbarPosition}
            onApplyStyle={applyStyle}
            currentStyle={textStyle}
          />
        )}
        
        {showContextMenu && (
          <ContextMenu
            position={contextMenuPosition}
            onClose={() => setShowContextMenu(false)}
            onAction={handleContextMenuAction}
            hasSelection={selection && selection.text.length > 0}
          />
        )}
      </EditorContent>
      
      <StatusBar>
        <div>Line: {cursorPosition.line}, Column: {cursorPosition.column}</div>
        <div>{currentFilePath.split('.').pop() || 'txt'}</div>
      </StatusBar>
      
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        type={dialogType}
        icon={dialogType === 'file' ? faFile : faFolder}
        title={dialogType === 'file' ? 'Create New File' : 'Create New Folder'}
        onSubmit={handleDialogSubmit}
        initialValue={dialogType === 'file' ? 'untitled.txt' : 'New Folder'}
      />
    </EditorContainer>
  );
};

export default TextEditor; 