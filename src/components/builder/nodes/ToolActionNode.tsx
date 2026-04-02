import { Handle, Position, useReactFlow } from '@xyflow/react';
import { AlertTriangle, X } from 'lucide-react';
import { getToolByActionId, IN_MEMORY_INTEGRATIONS } from '../../../lib/integrations';

interface ToolActionNodeProps {
    id: string;
    data: {
        label: string;
        actionId: string;
        description?: string;
        isConfigured?: boolean;
        configSummary?: Record<string, string>;
    };
    isConnectable: boolean;
    selected: boolean;
}

export function ToolActionNode({ id, data, isConnectable, selected }: ToolActionNodeProps) {
    const { deleteElements } = useReactFlow();
    const tool = getToolByActionId(data.actionId) || IN_MEMORY_INTEGRATIONS[0];
    const Icon = tool.icon;

    return (
        <div className="relative group font-sans">
            <div className={`w-[190px] h-[68px] bg-white rounded-lg border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:shadow-node-hover ${selected ? 'border-primary shadow-node-hover' : 'border-border'}`}>
                <div className="w-11 h-11 rounded-md flex items-center justify-center shrink-0 shadow-sm text-white" style={{ backgroundColor: tool.color }}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-[1.2] line-clamp-2">
                        {data.label || tool.name}
                    </div>
                    <div className="text-[9px] font-semibold uppercase tracking-tight mt-0.5" style={{ color: tool.color }}>
                        {tool.name}
                    </div>
                </div>

                {/* Status Indicator (Corner) */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.isConfigured === false && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteElements({ nodes: [{ id }] });
                    }}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border border-border/60 shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:border-status-error opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <Handle
                type="target"
                position={Position.Left}
                isConnectable={isConnectable}
                style={{ backgroundColor: tool.color }}
                className="handle-left"
            />
            <Handle
                type="source"
                position={Position.Right}
                isConnectable={isConnectable}
                style={{ backgroundColor: tool.color }}
                className="handle-right"
            />
        </div>
    );
}
