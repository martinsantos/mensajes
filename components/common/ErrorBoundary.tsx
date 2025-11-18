import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '../icons/HomeIcon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // fix: Switched to class field state initialization. This is a more modern
  // syntax and resolves issues with TypeScript not recognizing component properties
  // like `state`, `props`, and `setState`.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
            <h2 className="text-3xl font-bold text-red-600">Oops! Something Went Wrong</h2>
            <p className="mt-2 text-gray-600">We're sorry, but there was an error loading this article.</p>
            <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 mt-6 text-white transition-colors duration-200 rounded-md shadow-sm bg-primary-600 hover:bg-primary-700"
                onClick={() => this.setState({ hasError: false })}
            >
                <HomeIcon className="w-5 h-5 mr-2" />
                Back to Homepage
            </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;