import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
          <p className="max-w-md text-sm text-gray-500">{this.state.error.message}</p>
          <button
            type="button"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.assign('/')}
          >
            Reload app
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
