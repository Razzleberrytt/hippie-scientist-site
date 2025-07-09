import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center px-4">
          <div className="glass-card p-8 max-w-md mx-auto text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-psychedelic-orange" />
            <h2 className="text-2xl font-bold mb-4 psychedelic-text">
              Something went wrong
            </h2>
            <p className="text-gray-300 mb-6">
              We encountered an error while loading the page. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="glass-button bg-psychedelic-purple hover:bg-psychedelic-pink transition-colors px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
