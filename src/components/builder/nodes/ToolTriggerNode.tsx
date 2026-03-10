import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';
import { getToolByTriggerId, IN_MEMORY_INTEGRATIONS } from '../../../lib/integrations';

interface ToolTriggerNodeProps {
    id: string;
    data: {
        label: string;
        triggerId: string;
        description?: string;
        isConfigured?: boolean;
        configSummary?: Record<string, string>;
    };
    isConnectable: boolean;
    selected: boolean;
}

export function ToolTriggerNode({ id, data, isConnectable, selected }: ToolTriggerNodeProps) {
    const { deleteElements } = useReactFlow();
    const tool = getToolByTriggerId(data.triggerId) || IN_MEMORY_INTEGRATIONS[0];
    const Icon = tool.icon;

    return (
        <div className="relative group font-sans">
            <div className={`w-[320px] bg-white rounded-[32px] shadow-sm flex items-stretch overflow-visible transition-all hover:shadow-md border-2 
                        ${selected ? 'border-primary shadow-node-selected' : 'border-border'}`}>
                {/* Left Stripe */}
                <div className="w-6 shrink-0 rounded-l-[32px]" style={{ backgroundColor: tool.color }}></div>

                <div className="p-4 pl-3 flex-1 flex flex-col justify-center gap-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-sm text-white shrink-0" style={{ backgroundColor: tool.color }}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tool.color }}>
                            {tool.name} Trigger
                        </span>
                        {data.isConfigured === false && (
                            <div className="ml-auto text-status-warning tooltip" title="Configuration needed">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    <div className="text-sm font-bold text-text-primary truncate">{data.label}</div>

                    {data.configSummary && Object.keys(data.configSummary).length > 0 ? (
                        <div className="mt-2 text-[11px] rounded p-2 text-text-secondary border border-border space-y-1 bg-background-canvas">
                            {Object.entries(data.configSummary).map(([k, v]) => (
                                <div key={k} className="truncate"><span className="font-medium text-text-primary">{k}:</span> {v as React.ReactNode}</div>
                            ))}
                        </div>
                    ) : (data.description ? (
                        <div className="text-xs text-text-secondary mt-1 line-clamp-2">{data.description}</div>
                    ) : (
                        <div className="text-xs text-status-warning mt-1 flex items-center gap-1">
                            Configuration incomplete
                        </div>
                    ))}
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteElements({ nodes: [{ id }] });
                    }}
                    className="absolute top-0 right-4 w-6 h-6 bg-white border border-border shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:border-status-error opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="border-white" style={{ backgroundColor: tool.color }} isConnectable={isConnectable} />
            <AddBlockMenu sourceId={id} />
        </div>
    );
}
