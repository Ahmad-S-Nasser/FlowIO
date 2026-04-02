import { Handle, Position, useReactFlow } from '@xyflow/react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function TryCatchNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    return (
        <div className="relative group font-sans">
            <div className="w-[180px] h-[72px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover">
                <div className="w-10 h-10 rounded-md bg-status-error flex items-center justify-center shrink-0 shadow-sm text-white">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'Try / Catch'}
                    </div>
                    <div className="text-[9px] font-medium text-status-error uppercase tracking-tight mt-0.5">
                        Error Handling
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

            <Handle type="target" position={Position.Left} className="handle-error handle-left" />

            {/* Try/Catch/Finally handles stacked on the right */}
            <div className="absolute top-0 bottom-0 -right-[4px] flex flex-col justify-around py-1.5 h-full z-10">
                {/* Try Branch */}
                <div className="relative flex items-center justify-end h-6">
                    <span className="mr-2 text-[7px] font-bold text-status-success bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Try</span>
                    <Handle type="source" position={Position.Right} id="try" className="handle-success handle-right !static !transform-none" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="try" />
                    </div>
                </div>

                {/* Catch Branch */}
                <div className="relative flex items-center justify-end h-6">
                    <span className="mr-2 text-[7px] font-bold text-status-error bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Catch</span>
                    <Handle type="source" position={Position.Right} id="catch" className="handle-error handle-right !static !transform-none" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="catch" />
                    </div>
                </div>

                {/* Finally Branch */}
                <div className="relative flex items-center justify-end h-6">
                    <span className="mr-2 text-[7px] font-bold text-text-secondary bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Finally</span>
                    <Handle type="source" position={Position.Right} id="finally" className="handle-default handle-right !static !transform-none opacity-50" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="finally" />
                    </div>
                </div>
            </div>
        </div>
    );
}
