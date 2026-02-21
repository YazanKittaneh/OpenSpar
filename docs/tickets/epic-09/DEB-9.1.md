---
id: DEB-9.1
title: Implement Error Boundaries
ePic: Error Handling & Edge Cases
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [error-handling, react, boundaries]
---

## Description
Add error boundaries to catch and handle React errors gracefully.

## Acceptance Criteria
- [ ] Create `ErrorBoundary` component
- [ ] Wrap main page components
- [ ] Show user-friendly error messages
- [ ] Provide retry/refresh options
- [ ] Log errors for debugging

## Files Created
- `components/error-boundary.tsx`

## Definition of Done
- [ ] Errors caught gracefully
- [ ] Users see helpful messages
- [ ] App doesn't crash

## Code Template
```tsx
// components/error-boundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
          <div className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">{this.state.error?.message}</p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Dependencies
- DEB-1.2 (shadcn components)

## Blocks
None
