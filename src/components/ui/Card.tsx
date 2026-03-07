import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("bg-background-card rounded-card border border-border shadow-soft", className)}
            {...props}
        />
    );
}
