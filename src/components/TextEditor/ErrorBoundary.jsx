import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background-color: #2a1e3d;
  color: #f0f0f0;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  color: #ff79c6;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h2`
  color: #ff79c6;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  color: #d0c5e0;
  margin-bottom: 20px;
`;

const RetryButton = styled.button`
  background-color: rgba(95, 75, 139, 0.7);
  color: white;
  border: 1px solid rgba(255, 121, 198, 0.3);
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: rgba(255, 121, 198, 0.3);
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Error in TextEditor component:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </ErrorIcon>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            The text editor encountered an error and couldn't be displayed.
          </ErrorMessage>
          <RetryButton onClick={this.handleRetry}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 