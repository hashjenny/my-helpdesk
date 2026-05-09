import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-6 text-center">
              <div className="text-red-400 font-mono text-2xl mb-4">
                <span className="text-red-500">!</span> system error
              </div>
              <p className="text-amber-400/60 font-mono text-sm mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="border border-amber-500/50 bg-amber-500/10 text-amber-400 font-mono text-sm px-4 py-2 rounded hover:bg-amber-500/20 transition-colors"
              >
                [ reload ]
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}