import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function ConditionNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    const branches = data.branches || [
        { id: 'yes', label: 'Yes', color: 'success' },
        { id: 'no', label: 'No', color: 'warning' }
    ];

    return (
        <div className="relative group font-sans">
            <div className="w-[180px] h-[72px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover">
                <div className="w-10 h-10 rounded-md bg-status-warning flex items-center justify-center shrink-0 shadow-sm">
                    <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'If / Else'}
                    </div>
                    <div className="text-[9px] font-medium text-status-warning uppercase tracking-tight mt-0.5">
                        Logic
                    </div>
                </div>

                {/* Status Indicator (Corner) */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!data.isConfigured && <AlertTriangle className="w-3 h-3 text-status-error" />}
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

            <Handle type="target" position={Position.Left} className="handle-warning handle-left" />

            {/* Dynamic branches - Stacked on the right */}
            <div className="absolute top-0 bottom-0 -right-[4px] flex flex-col justify-around py-2 h-full z-10">
                {branches.map((branch: any) => {
                    const colorClass = branch.color === 'success' ? 'handle-success' : 'handle-warning';
                    const textColor = branch.color === 'success' ? 'text-status-success' : 'text-status-warning';
                    
                    return (
                        <div key={branch.id} className="relative flex items-center justify-end h-8">
                            <span className={`mr-2 text-[8px] font-bold ${textColor} bg-white px-1 rounded border border-border/40 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase`}>
                                {branch.label}
                            </span>
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={branch.id} 
                                className={`${colorClass} handle-right !static !transform-none`} 
                            />
                            <div className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <AddBlockMenu sourceId={id} branch={branch.id} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
