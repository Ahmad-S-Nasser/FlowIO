import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Repeat, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function LoopNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    return (
        <div className="relative group font-sans">
            <div className="w-[180px] h-[72px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover">
                <div className="w-10 h-10 rounded-md bg-status-info flex items-center justify-center shrink-0 shadow-sm">
                    <Repeat className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'For Each'}
                    </div>
                    <div className="text-[9px] font-medium text-status-info uppercase tracking-tight mt-0.5">
                        Loop
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
                    className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-border/60 shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:border-status-error opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <Handle type="target" position={Position.Left} className="handle-info handle-left" />

            {/* Loop branches - Stacked on the right */}
            <div className="absolute top-0 bottom-0 -right-[4px] flex flex-col justify-around py-2 h-full z-10">
                {/* Item Branch */}
                <div className="relative flex items-center justify-end h-8">
                    <span className="mr-2 text-[8px] font-bold text-status-info bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Item</span>
                    <Handle type="source" position={Position.Right} id="loop" className="handle-info handle-right !static !transform-none" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="loop" />
                    </div>
                </div>

                {/* Done Branch */}
                <div className="relative flex items-center justify-end h-8">
                    <span className="mr-2 text-[8px] font-bold text-text-secondary bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase">Done</span>
                    <Handle type="source" position={Position.Right} id="done" className="handle-info handle-right !static !transform-none opacity-50" />
                    <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <AddBlockMenu sourceId={id} branch="done" />
                    </div>
                </div>
            </div>
        </div>
    );
}
