import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Desktop from './components/Desktop/Desktop';
import { WindowProvider } from './hooks/useWindowManager.jsx';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  body {
    overflow: hidden;
    background-color: #12141c;
    color: white;
  }
`;

function App() {
  return (
    <WindowProvider>
      <GlobalStyle />
      <Desktop />
    </WindowProvider>
  );
}

export default App;
