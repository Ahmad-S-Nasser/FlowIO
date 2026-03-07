import { Handle, Position, useReactFlow } from '@xyflow/react';
import { AlertTriangle, X } from 'lucide-react';
import { getToolByActionId, IN_MEMORY_INTEGRATIONS } from '../../../lib/integrations';

interface ToolActionNodeProps {
    id: string; // Add id
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
        <div className={`relative group flex flex-col min-w-[280px] bg-white rounded-md shadow-node overflow-visible transition-all duration-200 border-2 
                        ${selected ? 'border-primary shadow-node-selected' : 'border-transparent'}`}
        >
            {/* IN Handle */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-white border-2 border-text-secondary rounded-full -top-1.5"
            />

            {/* Colored Left Border mapping to the Tool */}
            <div className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-md" style={{ backgroundColor: tool.color }} />

            <div className="flex flex-col p-4 pl-6">
                {/* Standard Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1 rounded-sm text-white" style={{ backgroundColor: tool.color }}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tool.color }}>
                            {tool.name}
                        </span>
                    </div>
                    {data.isConfigured === false && (
                        <div className="text-status-warning tooltip" title="Configuration needed">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* Body */}
                <h3 className="font-bold text-text-primary text-base mb-1">{data.label}</h3>

                {data.description && !data.configSummary && (
                    <p className="text-sm text-text-secondary leading-tight mt-1">
                        {data.description}
                    </p>
                )}

                {/* Configuration Summary Map */}
                {data.configSummary && Object.keys(data.configSummary).length > 0 && (
                    <div className="mt-3 bg-background-canvas rounded-card border border-border p-2 space-y-1">
                        {Object.entries(data.configSummary).map(([key, value]) => (
                            <div key={key} className="flex flex-row items-center gap-2 overflow-hidden">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider shrink-0 w-16">{key}:</span>
                                <span className="text-xs text-text-primary truncate">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    deleteElements({ nodes: [{ id }] });
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-border shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:border-status-error opacity-0 group-hover:opacity-100 transition-all z-20"
            >
                <X className="w-3 h-3" />
            </button>

            {/* Default OUT Handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-white border-2 border-text-secondary rounded-full -bottom-1.5 z-10"
            />
        </div>
    );
}
