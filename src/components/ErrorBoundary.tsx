import React from 'react'
import { recordDevMessage } from '../utils/devMessages'

interface Props {
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
}
export default class ErrorBoundary extends React.Component<React.PropsWithChildren<Props>, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordDevMessage('error', 'Caught error in ErrorBoundary', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='rounded border border-red-400 bg-red-100 p-4 text-center text-red-600 shadow'>
            <h2 className='text-xl font-bold'>Something went wrong</h2>
            <p className='mt-2 text-sm'>Please refresh the page or try again later.</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
