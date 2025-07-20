import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }
      return (
        <div className='p-6 text-center'>
          <h1 className='mb-4 text-2xl font-bold text-red-400'>Something went wrong.</h1>
          <p className='text-sand'>Please try refreshing the page.</p>
        </div>
      )
    }
    return this.props.children
  }
}
