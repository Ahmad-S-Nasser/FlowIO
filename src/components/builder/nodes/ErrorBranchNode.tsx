import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function ErrorBranchNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    return (
        <div className="relative group font-sans">
            <div className="w-[180px] h-[72px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover">
                <div className="w-10 h-10 rounded-md bg-status-warning flex items-center justify-center shrink-0 shadow-sm">
                    <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'Error Branch'}
                    </div>
                    <div className="text-[9px] font-medium text-status-warning uppercase tracking-tight mt-0.5">
                        Logic
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

            <Handle type="target" position={Position.Left} className="handle-default handle-left" />

            {/* Error/Success handles stacked on the right */}
            <div className="absolute top-0 bottom-0 -right-[4px] flex flex-col justify-around py-2 h-full z-10">
                {/* On Error */}
                <div className="relative flex items-center justify-end h-8">
                    <span className="mr-2 text-[8px] font-bold text-status-error bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">On Error</span>
                    <Handle type="source" position={Position.Right} id="on_error" className="handle-error handle-right !static !transform-none" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="on_error" />
                    </div>
                </div>

                {/* On Success */}
                <div className="relative flex items-center justify-end h-8">
                    <span className="mr-2 text-[8px] font-bold text-status-success bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">On Success</span>
                    <Handle type="source" position={Position.Right} id="on_success" className="handle-success handle-right !static !transform-none" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="on_success" />
                    </div>
                </div>
            </div>
        </div>
    );
}
