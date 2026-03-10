import { Handle, Position, useReactFlow } from '@xyflow/react';
import { RotateCw, ShieldAlert, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function UtilityNode({ id, data, isConnectable, selected }: any) {
    const { deleteElements } = useReactFlow();
    const isRetry = data.label === 'Retry Step';
    const Icon = isRetry ? RotateCw : ShieldAlert;
    const bgColorClass = isRetry ? 'bg-status-info' : 'bg-status-error';
    const textColorClass = isRetry ? 'text-status-info' : 'text-status-error';

    return (
        <div className={`relative group font-sans flex flex-col rounded-md transition-all duration-200 border-2 z-10 
                        ${selected ? 'border-primary shadow-node-selected' : 'border-transparent'}`}>
            <Handle
                type="target"
                position={Position.Top}
                className={`-top-1.5 ${isRetry ? 'handle-info' : 'handle-error'}`}
                isConnectable={isConnectable}
            />

            <div className="w-[280px] bg-white rounded-md shadow-node flex items-stretch overflow-visible transition-all hover:shadow-md">
                <div className={`w-2.5 shrink-0 rounded-l-md ${bgColorClass}`}></div>
                <div className="p-4 pl-4 flex-1 flex flex-col justify-center min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1 rounded-sm text-white ${bgColorClass}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${textColorClass}`}>
                            {isRetry ? 'Utility Flow' : 'Error Handling'}
                        </span>
                    </div>
                    <div className="text-sm font-bold text-text-primary truncate">{data.label}</div>

                    {data.configSummary && Object.keys(data.configSummary).length > 0 ? (
                        <div className="mt-2 text-xs bg-background-canvas rounded p-2 text-text-secondary border border-border space-y-1">
                            {Object.entries(data.configSummary).map(([k, v]) => (
                                <div key={k} className="truncate"><span className="font-medium text-text-primary">{k}:</span> {v as React.ReactNode}</div>
                            ))}
                        </div>
                    ) : (data.description ? (
                        <div className="text-xs text-text-secondary mt-1 line-clamp-2">{data.description}</div>
                    ) : null)}
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
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className={`-bottom-1.5 z-10 ${isRetry ? 'handle-info' : 'handle-error'}`}
                isConnectable={isConnectable}
            />
            <AddBlockMenu sourceId={id} />
        </div>
    );
}
