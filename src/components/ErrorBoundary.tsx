import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 max-w-md w-full text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <AlertTriangle className="w-16 h-16 text-psychedelic-orange mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-4 psychedelic-text">
              Consciousness Disruption Detected
            </h2>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              The psychedelic matrix has encountered a dimensional anomaly. 
              Let's realign the cosmic frequencies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => window.location.reload()}
                className="glass-button bg-psychedelic-purple text-white px-6 py-3 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Reality
              </motion.button>
              
              <motion.button
                onClick={() => window.location.href = '/'}
                className="glass-button border border-psychedelic-cyan text-psychedelic-cyan px-6 py-3 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </motion.button>
            </div>
            
            {/* Show technical details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-psychedelic-pink">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-black/50 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
