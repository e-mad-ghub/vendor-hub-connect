import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  primaryAction?: EmptyStateAction;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, primaryAction }) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {primaryAction && (
        <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>
      )}
    </div>
  );
};
