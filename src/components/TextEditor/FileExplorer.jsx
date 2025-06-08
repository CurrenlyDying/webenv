import React, { useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder, 
  faFolderOpen, 
  faFile, 
  faFileLines, 
  faFileCode, 
  faFileImage,
  faFilePdf,
  faChevronRight,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const ExplorerContainer = styled.div`
  position: relative;
  width: 220px;
  height: 100%;
  background-color: rgba(50, 35, 75, 0.8);
  border-right: 1px solid #4b3b5d;
  padding: 8px 0;
  overflow-y: auto;
  flex-shrink: 0;
  
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

const ExplorerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 8px 12px;
  border-bottom: 1px solid rgba(100, 100, 120, 0.3);
  margin-bottom: 8px;
`;

const ExplorerTitle = styled.div`
  color: #d0c5e0;
  font-size: 13px;
  font-weight: 500;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: #d0c5e0;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  margin-left: 4px;
  border-radius: 3px;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.2);
  }
`;

const DirectoryItem = styled.div`
  padding: 4px 8px 4px ${props => props.depth * 12 + 8}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
  user-select: none;
  
  &:hover {
    background-color: rgba(70, 50, 110, 0.5);
  }
  
  ${props => props.active && `
    background-color: rgba(70, 50, 110, 0.7);
  `}
`;

const FileItem = styled.div`
  padding: 4px 8px 4px ${props => props.depth * 12 + 28}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  
  &:hover {
    background-color: rgba(70, 50, 110, 0.5);
  }
  
  ${props => props.active && `
    background-color: rgba(70, 50, 110, 0.7);
    color: #ff79c6;
  `}
`;

const ItemIcon = styled.span`
  margin-right: 6px;
  color: ${props => props.color || '#d0c5e0'};
  width: 16px;
  text-align: center;
  user-select: none;
  pointer-events: none;
`;

const ItemName = styled.span`
  color: ${props => props.isFile ? '#f0f0f0' : '#d0c5e0'};
  font-size: 13px;
  user-select: none;
  pointer-events: none;
`;

const ToggleIcon = styled.span`
  position: absolute;
  left: ${props => props.depth * 12 + 4}px;
  color: #d0c5e0;
  user-select: none;
  pointer-events: none;
`;

const FileExplorer = ({ 
  fileSystem, 
  onFileClick, 
  currentFilePath, 
  onCreateFile, 
  onCreateDirectory
}) => {
  const [expandedDirs, setExpandedDirs] = useState({'/': true, '/home': true, '/home/user': true, '/home/user/documents': true});
  
  const toggleDirectory = (path) => {
    setExpandedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'md':
      case 'txt':
        return <FontAwesomeIcon icon={faFileLines} />;
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'json':
      case 'html':
      case 'css':
        return <FontAwesomeIcon icon={faFileCode} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FontAwesomeIcon icon={faFileImage} />;
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} />;
      default:
        return <FontAwesomeIcon icon={faFile} />;
    }
  };
  
  const getFileIconColor = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'md':
        return '#bd93f9';
      case 'js':
      case 'jsx':
        return '#f1fa8c';
      case 'ts':
      case 'tsx':
        return '#8be9fd';
      case 'json':
        return '#f1fa8c';
      case 'html':
        return '#ff5555';
      case 'css':
        return '#ff79c6';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return '#ff79c6';
      default:
        return '#d0c5e0';
    }
  };
  
  const startNewFile = (path) => {
    // Make sure the path is clean before sending it to parent
    const cleanPath = path.replace(/\/+/g, '/');
    // Call the parent component's handler
    onCreateFile(cleanPath);
  };
  
  const startNewDirectory = (path) => {
    // Make sure the path is clean before sending it to parent
    const cleanPath = path.replace(/\/+/g, '/');
    // Call the parent component's handler
    onCreateDirectory(cleanPath);
  };
  
  const renderDirectoryContents = (node, path, depth = 0) => {
    try {
      if (!node || node.type !== 'directory') return null;
      
      // Check if contents exists to prevent errors
      if (!node.contents) {
        console.error('Directory has no contents', path);
        return <div style={{ padding: '10px', color: '#ff79c6' }}>Error: Invalid directory structure</div>;
      }
      
      const items = Object.entries(node.contents || {})
        .sort(([nameA, nodeA], [nameB, nodeB]) => {
          // Check if nodes exist
          if (!nodeA || !nodeB) return 0;
          
          // Directories first, then files
          if (nodeA.type === 'directory' && nodeB.type !== 'directory') return -1;
          if (nodeA.type !== 'directory' && nodeB.type === 'directory') return 1;
          return nameA.localeCompare(nameB);
        });
      
      if (items.length === 0) {
        return <div style={{ padding: '10px 8px 4px ' + (depth * 12 + 28) + 'px', color: '#8b7fa0', fontSize: '12px', fontStyle: 'italic' }}>Empty directory</div>;
      }
      
      return (
        <>
          {items.map(([name, item]) => {
            if (!item) return null; // Skip invalid items
            
            const itemPath = `${path}/${name}`.replace(/\/+/g, '/');
            
            if (item.type === 'directory') {
              const isExpanded = expandedDirs[itemPath];
              
              return (
                <React.Fragment key={itemPath}>
                  <DirectoryItem 
                    depth={depth}
                    onClick={() => toggleDirectory(itemPath)}
                  >
                    <ToggleIcon depth={depth}>
                      <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                    </ToggleIcon>
                    <ItemIcon>
                      <FontAwesomeIcon icon={isExpanded ? faFolderOpen : faFolder} color="#bd93f9" />
                    </ItemIcon>
                    <ItemName>{name}</ItemName>
                  </DirectoryItem>
                  
                  {isExpanded && (
                    <>
                      {renderDirectoryContents(item, itemPath, depth + 1)}
                      {items.length === 0 && (
                        <div style={{ 
                          display: 'flex', 
                          padding: '10px 8px 4px ' + (depth * 12 + 38) + 'px',
                          justifyContent: 'center'
                        }}>
                          <ActionButton 
                            title="New File"
                            onClick={() => startNewFile(itemPath)}
                          >
                            <FontAwesomeIcon icon={faFile} size="xs" />
                          </ActionButton>
                          <ActionButton 
                            title="New Folder"
                            onClick={() => startNewDirectory(itemPath)}
                          >
                            <FontAwesomeIcon icon={faFolder} size="xs" />
                          </ActionButton>
                        </div>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            } else {
              return (
                <FileItem 
                  key={itemPath}
                  depth={depth}
                  active={currentFilePath === itemPath}
                  onClick={() => onFileClick(itemPath)}
                >
                  <ItemIcon color={getFileIconColor(name)}>
                    {getFileIcon(name)}
                  </ItemIcon>
                  <ItemName isFile>{name}</ItemName>
                </FileItem>
              );
            }
          })}
        </>
      );
    } catch (error) {
      console.error('Error rendering directory contents:', error);
      return <div style={{ padding: '10px', color: '#ff79c6' }}>Error loading directory</div>;
    }
  };
  
  // Start rendering the file explorer from the root
  return (
    <ExplorerContainer>
      <ExplorerHeader>
        <ExplorerTitle>EXPLORER</ExplorerTitle>
        <div>
          <ActionButton 
            title="New File" 
            onClick={() => startNewFile('/home/user/documents')}
          >
            <FontAwesomeIcon icon={faFile} />
          </ActionButton>
          <ActionButton 
            title="New Folder" 
            onClick={() => startNewDirectory('/home/user/documents')}
          >
            <FontAwesomeIcon icon={faFolder} />
          </ActionButton>
        </div>
      </ExplorerHeader>
      
      {renderDirectoryContents(fileSystem['/'], '/', 0)}
    </ExplorerContainer>
  );
};

export default FileExplorer; 