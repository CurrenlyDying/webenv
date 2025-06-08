import { useState, useCallback, useEffect } from 'react';
import createCommandList from './terminalCommands';

export const useFileSystem = () => {
  // Initial file system structure with a hardcoded README.md
  const initialFileSystem = {
    '/': {
      type: 'directory',
      contents: {
        home: {
          type: 'directory',
          contents: {
            user: {
              type: 'directory',
              contents: {
                documents: {
                  type: 'directory',
                  contents: {
                    'readme.txt': {
                      type: 'file',
                      content: 'Welcome to the PutEnv terminal!\nType "help" to see available commands.',
                      size: 73,
                      created: new Date().toISOString(),
                      modified: new Date().toISOString(),
                    },
                    'README.md': {
                      type: 'file',
                      content: `# Welcome to PutEnv Text Editor

This is a simple text editor inspired by micro, with some additional features like a floating toolbar.

## Features

- Syntax highlighting for various file formats
- Text formatting with floating toolbar
- File saving and loading
- Integration with terminal file system
- File explorer with easy navigation

## Links

- [GitHub](https://github.com/CurrenlyDying)
- [LinkedIn](https://www.linkedin.com/in/ziad-rabah/)

Feel free to explore and edit this file!`,
                      size: 429,
                      created: new Date().toISOString(),
                      modified: new Date().toISOString(),
                    },
                  },
                },
                pictures: {
                  type: 'directory',
                  contents: {},
                },
                music: {
                  type: 'directory',
                  contents: {},
                },
                downloads: {
                  type: 'directory',
                  contents: {},
                },
              },
            },
          },
        },
        bin: {
          type: 'directory',
          contents: {},
        },
        etc: {
          type: 'directory',
          contents: {
            'motd.txt': {
              type: 'file',
              content: 'Message of the day: Have a wonderful day in the virtual world!',
              size: 58,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
            },
          },
        },
        usr: {
          type: 'directory',
          contents: {},
        },
        tmp: {
          type: 'directory',
          contents: {},
        },
      },
    },
  };

  const [fileSystem, setFileSystem] = useState(() => {
    try {
      // Try to load file system from localStorage
      const savedFileSystem = localStorage.getItem('putenv-file-system');
      if (savedFileSystem) {
        try {
          const parsed = JSON.parse(savedFileSystem);
          // Basic validation to ensure we have a proper file system structure
          if (parsed && parsed['/'] && parsed['/'].type === 'directory') {
            // Make sure README.md is always in its original state
            if (parsed['/'].contents.home?.contents.user?.contents.documents?.contents) {
              parsed['/'].contents.home.contents.user.contents.documents.contents['README.md'] = 
                initialFileSystem['/'].contents.home.contents.user.contents.documents.contents['README.md'];
            }
            return parsed;
          } else {
            console.error('Invalid file system structure in localStorage');
            return initialFileSystem;
          }
        } catch (parseError) {
          console.error('Failed to parse file system from localStorage:', parseError);
          // Clear the corrupted storage
          localStorage.removeItem('putenv-file-system');
          return initialFileSystem;
        }
      }
      return initialFileSystem;
    } catch (e) {
      console.error('Failed to load file system from localStorage:', e);
      return initialFileSystem;
    }
  });
  
  // Ensure README.md always exists
  useEffect(() => {
    try {
      // Check if the documents directory exists
      if (fileSystem['/']?.contents?.home?.contents?.user?.contents?.documents) {
        const docsDir = fileSystem['/'].contents.home.contents.user.contents.documents;
        
        // Make sure README.md exists with correct content
        if (!docsDir.contents['README.md']) {
          console.log('Restoring missing README.md file');
          
          // Update file system without causing infinite loop
          setFileSystem(prevFs => {
            // Make a copy to avoid mutating state directly
            const newFs = JSON.parse(JSON.stringify(prevFs));
            
            // Add README.md to documents directory
            if (newFs['/']?.contents?.home?.contents?.user?.contents?.documents) {
              newFs['/'].contents.home.contents.user.contents.documents.contents['README.md'] = 
                initialFileSystem['/'].contents.home.contents.user.contents.documents.contents['README.md'];
            }
            
            return newFs;
          });
        }
      }
    } catch (e) {
      console.error('Failed to check for README.md:', e);
    }
  }, []); // Only run once on component mount

  // Save file system to localStorage whenever it changes
  useEffect(() => {
    try {
      // Save to localStorage
      const serialized = JSON.stringify(fileSystem);
      localStorage.setItem('putenv-file-system', serialized);
    } catch (e) {
      console.error('Failed to save file system to localStorage:', e);
    }
  }, [fileSystem]);

  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [env, setEnv] = useState({
    PATH: '/bin:/usr/bin',
    USER: 'user',
    HOME: '/home/user',
    TERM: 'xterm-256color',
    SHELL: '/bin/bash',
  });

  // Helper to get a node from a path
  const getNodeAtPath = useCallback((path) => {
    try {
      if (!path) {
        console.error('Invalid path provided to getNodeAtPath:', path);
        return { node: null, path: '/' };
      }
      
      const normalizedPath = path.startsWith('/') ? path : `${currentDirectory}/${path}`;
      const cleanPath = normalizedPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
      
      const parts = cleanPath.split('/').filter(Boolean);
      
      // Handle root path
      if (cleanPath === '/') return { node: fileSystem['/'], path: cleanPath };
      
      // Start at root
      let current = fileSystem['/'];
      if (!current) {
        console.error('Root node not found in file system');
        return { node: null, path: cleanPath };
      }
      
      // Traverse path parts
      for (const part of parts) {
        if (!current.contents) {
          console.error(`Node at ${cleanPath} has no contents property`);
          return { node: null, path: cleanPath };
        }
        
        if (!current.contents[part]) {
          console.log(`Part ${part} not found in path ${cleanPath}`);
          return { node: null, path: cleanPath };
        }
        
        current = current.contents[part];
      }
      
      return { node: current, path: cleanPath };
    } catch (error) {
      console.error('Error in getNodeAtPath:', error);
      return { node: null, path: path || '/' };
    }
  }, [currentDirectory, fileSystem]);

  // Helper to resolve path
  const resolvePath = useCallback((path) => {
    // Absolute path
    if (path.startsWith('/')) return path;
    
    // Home directory
    if (path.startsWith('~')) {
      return path.replace('~', '/home/user');
    }
    
    // Current directory or parent
    const parts = currentDirectory.split('/').filter(Boolean);
    
    if (path === '.') return currentDirectory;
    
    if (path === '..') {
      if (parts.length === 0) return '/';
      parts.pop();
      return `/${parts.join('/')}`;
    }
    
    // Relative path with ../ components
    if (path.includes('../') || path.includes('./')) {
      const pathParts = path.split('/');
      const resultParts = [...parts];
      
      for (const part of pathParts) {
        if (part === '.') continue;
        if (part === '..') {
          if (resultParts.length > 0) resultParts.pop();
          continue;
        }
        resultParts.push(part);
      }
      
      return `/${resultParts.join('/')}`;
    }
    
    // Simple relative path
    return `${currentDirectory}/${path}`.replace(/\/+/g, '/');
  }, [currentDirectory]);

  // Initialize commands with filesystem helpers
  const { commandList } = createCommandList({
    getNodeAtPath,
    resolvePath,
    currentDirectory,
    setCurrentDirectory,
    setFileSystem,
    env
  });
  
  // Parse command and execute
  const executeCommand = useCallback((input) => {
    // Handle piping, redirects, and other special cases later
    const [commandPart, ...args] = input.trim().split(' ');
    
    if (!commandPart) return '';
    
    const command = commandList[commandPart];
    
    if (!command) {
      if (Math.random() < 0.1) {
        return `Command not found: ${commandPart}\n\nDid you know we have over 200 simulated commands? Try 'funhelp' to discover some fun ones!`;
      }
      return `Command not found: ${commandPart}`;
    }
    
    try {
      return command(args);
    } catch (error) {
      console.error(error);
      return `Error executing command: ${commandPart}`;
    }
  }, [commandList]);
  
  // Save user-modified files to cookies
  const saveFileToCookie = useCallback((path, content) => {
    try {
      // Save file content to a cookie
      // Set cookie to expire in 30 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      // Encode the path to avoid issues with special characters
      const encodedPath = encodeURIComponent(path);
      
      // Set the cookie with the file content
      // For large files, localStorage might be more appropriate
      if (content.length > 4000) {
        // Use localStorage for larger files
        localStorage.setItem(`putenv-file-${encodedPath}`, content);
      } else {
        // Use cookies for smaller files
        document.cookie = `putenv-file-${encodedPath}=${encodeURIComponent(content)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
      }
      
      return true;
    } catch (e) {
      console.error('Failed to save file to cookie:', e);
      return false;
    }
  }, []);

  // Get file content from cookie
  const getFileFromCookie = useCallback((path) => {
    try {
      const encodedPath = encodeURIComponent(path);
      
      // First check localStorage for larger files
      const localStorageContent = localStorage.getItem(`putenv-file-${encodedPath}`);
      if (localStorageContent) {
        return localStorageContent;
      }
      
      // Then check cookies for smaller files
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(`putenv-file-${encodedPath}=`)) {
          return decodeURIComponent(cookie.substring(`putenv-file-${encodedPath}=`.length));
        }
      }
      
      return null;
    } catch (e) {
      console.error('Failed to retrieve file from cookie:', e);
      return null;
    }
  }, []);

  return {
    currentDirectory,
    fileSystem,
    executeCommand,
    saveFileToCookie,
    getFileFromCookie,
    getNodeAtPath,
    resolvePath,
    setFileSystem,
    setCurrentDirectory
  };
};

export default useFileSystem; 