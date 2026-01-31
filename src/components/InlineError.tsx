import React from 'react';
import { Button } from '@/components/ui/button';

interface InlineErrorProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export const InlineError: React.FC<InlineErrorProps> = ({ title, message, onRetry }) => {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-destructive" role="alert" aria-live="polite">
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-destructive/90 mb-3">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="border-destructive/50 text-destructive">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
};
