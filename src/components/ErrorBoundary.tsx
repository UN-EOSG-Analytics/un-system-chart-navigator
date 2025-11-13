"use client";

import React from "react";
import Link from "next/link";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    resetError: () => void;
  }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="mb-4 text-gray-600">
              There was an error loading this page. Please try refreshing or go
              back to the home page.
            </p>
            <div className="space-x-4">
              <button
                onClick={this.resetError}
                className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="inline-block rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
              >
                Go Home
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-600">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
