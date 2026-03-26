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
            <div className="w-[320px] bg-white rounded-[32px] shadow-sm border border-border flex items-stretch overflow-visible transition-all hover:shadow-md">
                {/* Left Stripe */}
                <div className="w-6 bg-status-success shrink-0 rounded-l-[32px]"></div>

                <div className="p-4 flex-1 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-status-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-status-success uppercase tracking-wider mb-1 flex items-center justify-between">
                            Trigger
                            {(!data.isConfigured && data.label !== 'Trigger') && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                        </div>
                        <div className="text-sm font-bold text-text-primary truncate">{data.label || 'Select Trigger'}</div>

                        {data.configSummary ? (
                            <div className="mt-2 text-xs bg-status-success/5 rounded p-2 text-text-secondary border border-status-success/10 space-y-1">
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

            <Handle type="source" position={Position.Bottom} className="handle-success" />
            <AddBlockMenu sourceId={id} />
        </div>
    );
}
