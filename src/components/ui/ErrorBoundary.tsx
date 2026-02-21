import { Component, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Something went wrong</span>
          </div>
          <p className="text-sm text-red-600 mb-4">
            This component encountered an unexpected error.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
