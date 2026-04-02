import { Handle, Position, useReactFlow } from '@xyflow/react';
import { RotateCw, ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function UtilityNode({ id, data, isConnectable, selected }: any) {
    const { deleteElements } = useReactFlow();
    const isRetry = data.label === 'Retry Step';
    const Icon = isRetry ? RotateCw : ShieldAlert;
    const bgColorClass = isRetry ? 'bg-status-info' : 'bg-status-error';
    const textColorClass = isRetry ? 'text-status-info' : 'text-status-error';

    return (
        <div className="relative group font-sans">
            <div className={`w-[180px] h-[64px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover ${selected ? 'border-primary shadow-node-hover' : ''}`}>
                <div className={`w-10 h-10 rounded-md ${bgColorClass} flex items-center justify-center shrink-0 shadow-sm text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'Utility'}
                    </div>
                    <div className={`text-[9px] font-medium ${textColorClass} uppercase tracking-tight mt-0.5`}>
                        {isRetry ? 'Utility' : 'Error'}
                    </div>
                </div>

                {/* Status Indicator (Corner) */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!data.isConfigured && <AlertTriangle className="w-3 h-3 text-status-warning" />}
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
                className={`${isRetry ? 'handle-info handle-left' : 'handle-error handle-left'}`}
                isConnectable={isConnectable}
            />
            <Handle
                type="source"
                position={Position.Right}
                className={`${isRetry ? 'handle-info handle-right' : 'handle-error handle-right'}`}
                isConnectable={isConnectable}
            />
            <AddBlockMenu sourceId={id} />
        </div>
    );
}
