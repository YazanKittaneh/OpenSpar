"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
            <div className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
              <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
              <p className="mb-4 text-zinc-400">{this.state.error?.message}</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => this.setState({ hasError: false, error: undefined })}>
                  Retry
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
