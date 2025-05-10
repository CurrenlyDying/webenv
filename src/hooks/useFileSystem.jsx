import { useState, useCallback } from 'react';
import createCommandList from './terminalCommands';

export const useFileSystem = () => {
  // Initial file system structure
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

  const [fileSystem, setFileSystem] = useState(initialFileSystem);
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
    const normalizedPath = path.startsWith('/') ? path : `${currentDirectory}/${path}`;
    const cleanPath = normalizedPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    
    const parts = cleanPath.split('/').filter(Boolean);
    let current = fileSystem['/'];
    
    if (cleanPath === '/') return { node: current, path: cleanPath };
    
    for (const part of parts) {
      if (!current.contents || !current.contents[part]) {
        return { node: null, path: cleanPath };
      }
      current = current.contents[part];
    }
    
    return { node: current, path: cleanPath };
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
  
  return {
    currentDirectory,
    fileSystem,
    executeCommand,
  };
};

export default useFileSystem; 