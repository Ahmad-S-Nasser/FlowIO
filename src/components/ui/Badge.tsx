import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            {
                'border-status-success text-status-success bg-status-success/10': variant === 'success',
                'border-status-warning text-status-warning bg-status-warning/10': variant === 'warning',
                'border-status-error text-status-error bg-status-error/10': variant === 'error',
                'border-status-info text-status-info bg-status-info/10': variant === 'info',
                'border-border text-text-secondary bg-background-canvas': variant === 'default',
            },
            className
        )} {...props} />
    );
}
