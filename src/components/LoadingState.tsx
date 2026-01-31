import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ title = 'جاري التحميل...', message }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <h3 className="text-base font-semibold">{title}</h3>
      {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
    </div>
  );
};
