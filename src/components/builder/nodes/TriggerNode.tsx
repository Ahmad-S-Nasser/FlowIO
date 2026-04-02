import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Zap, AlertTriangle, X, Play, Database, FileText, Calendar, Trash2, Edit } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function TriggerNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    let Icon = Zap;
    if (data.label === 'Manual Trigger') Icon = Play;
    if (data.label === 'Schedule') Icon = Calendar;
    if (data.label === 'Form Submitted') Icon = FileText;
    if (data.label === 'Record Created') Icon = Database;
    if (data.label === 'Record Deleted') Icon = Trash2;
    if (data.label === 'Field Updated') Icon = Edit;

    return (
        <div className="relative group font-sans">
            <div className="w-[180px] h-[64px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover">
                <div className="w-10 h-10 rounded-md bg-status-success flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-tight truncate">
                        {data.label || 'Trigger'}
                    </div>
                    <div className="text-[9px] font-medium text-text-secondary uppercase tracking-tight mt-0.5">
                        Trigger
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

            <Handle type="source" position={Position.Right} className="handle-success handle-right" />
            
            {/* Connection Label Mockup (In reality, edges handle this) */}
            <AddBlockMenu sourceId={id} />
        </div>
    );
}
