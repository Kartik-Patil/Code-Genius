import { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // Keep logging lightweight while still surfacing component crashes in dev tools.
    console.error('Error boundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">{this.props.fallbackMessage || 'Something went wrong.'}</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
