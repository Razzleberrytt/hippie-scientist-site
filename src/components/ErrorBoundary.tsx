
// src/components/ErrorBoundary.tsx
import React from 'react';

interface Props {
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<Props>, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Caught error in ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='text-center text-red-600 border border-red-400 bg-red-100 p-4 rounded shadow'>
          <h2 className='text-xl font-bold'>Something went wrong</h2>
          <p className='mt-2 text-sm'>An unexpected error occurred. Please refresh the page and report this issue.</p>
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}
