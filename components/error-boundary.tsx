"use client";

import { Component, ErrorInfo, ReactNode } from "react";

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
          <div className="min-h-screen bg-background text-foreground p-6">
            <div className="mx-auto max-w-lg pt-20">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#FF4500]">
                System_Error
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight">
                Something went wrong
              </h1>
              <div className="mt-3 h-px w-16 bg-[#FF4500]" />
              <p className="mt-4 text-sm text-muted-foreground">
                {this.state.error?.message}
              </p>
              <div className="mt-8 flex gap-3">
                <Button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                >
                  Retry
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload
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
