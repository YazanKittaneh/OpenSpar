---
id: DEB-8.4
title: Create Debate Control Bar
ePic: Frontend - Debate View Page
priority: P1
status: TODO
points: 3
assignee: TBD
labels: [frontend, components, controls]
---

## Description
Build the control bar for user interaction during debates.

## Acceptance Criteria
- [ ] Create `ControlBar` component
- [ ] Add Pause/Resume button with icon
- [ ] Add Skip Turn button
- [ ] Add Inject Comment button (with modal)
- [ ] Disable controls when debate completed
- [ ] Show button states (loading, disabled)

## Files Created
- `components/control-bar.tsx`

## Definition of Done
- [ ] All buttons functional
- [ ] Actions trigger API calls
- [ ] UI feedback on actions

## Code Template
```tsx
// components/control-bar.tsx
import { Button } from '@/components/ui/button';
import { Pause, Play, SkipForward, MessageSquare } from 'lucide-react';

interface ControlBarProps {
  isPaused: boolean;
  isCompleted: boolean;
  onPause: () => void;
  onSkip: () => void;
  onInject: (comment: string) => void;
}

export function ControlBar({ 
  isPaused, 
  isCompleted, 
  onPause, 
  onSkip, 
  onInject 
}: ControlBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPause}
        disabled={isCompleted}
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onSkip}
        disabled={isCompleted}
      >
        <SkipForward className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const comment = prompt('Enter your comment:');
          if (comment) onInject(comment);
        }}
        disabled={isCompleted}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

## Dependencies
- DEB-1.2 (shadcn components)
- DEB-5.2 (User actions handler)
- DEB-6.3 (Action API route)

## Blocks
None (used by 8.2)
