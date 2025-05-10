import { createContext, useContext, useState, useCallback } from 'react';

const WindowContext = createContext();

export const WindowProvider = ({ children }) => {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [apps, setApps] = useState([]);

  const openWindow = useCallback((app) => {
    const newWindow = {
      id: `window-${Date.now()}`,
      app,
      title: app.title,
      icon: app.icon,
      isMinimized: false,
      position: { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 },
      size: app.defaultSize || { width: 800, height: 600 },
      zIndex: windows.length + 1,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    return newWindow.id;
  }, [windows]);

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(window => window.id !== id));
    if (activeWindowId === id) {
      const remainingWindows = windows.filter(window => window.id !== id);
      setActiveWindowId(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null);
    }
  }, [windows, activeWindowId]);

  const minimizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMinimized: true } : window
    ));
    
    // When minimizing a window, focus the next visible window if available
    if (activeWindowId === id) {
      const visibleWindows = windows.filter(w => !w.isMinimized && w.id !== id);
      if (visibleWindows.length > 0) {
        const nextWindowToFocus = visibleWindows.reduce((prev, current) => 
          (prev.zIndex > current.zIndex) ? prev : current
        );
        setActiveWindowId(nextWindowToFocus.id);
      } else {
        setActiveWindowId(null); // No visible windows, focus on desktop
      }
    }
  }, [windows, activeWindowId]);

  const focusWindow = useCallback((id) => {
    if (!id) return;
    
    setActiveWindowId(id);
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.zIndex), 0);
      return prev.map(window => 
        window.id === id ? { ...window, zIndex: maxZ + 1, isMinimized: false } : window
      );
    });
  }, []);

  const updateWindowPosition = useCallback((id, position) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, position } : window
    ));
  }, []);

  const updateWindowSize = useCallback((id, size) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, size } : window
    ));
  }, []);

  const registerApp = useCallback((app) => {
    setApps(prev => [...prev, app]);
  }, []);

  return (
    <WindowContext.Provider value={{
      windows,
      activeWindowId,
      apps,
      openWindow,
      closeWindow,
      minimizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      registerApp,
    }}>
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowProvider');
  }
  return context;
}; 