import { Handle, Position } from '@xyflow/react';
import { Mail, CheckSquare, AlertTriangle } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function ActionNode({ id, data }: any) {
    const Icon = data.label === 'Create Task' ? CheckSquare : Mail;

    return (
        <div className="relative group font-sans">
            <div className="w-[320px] bg-white rounded-md shadow-sm border border-border flex items-stretch overflow-hidden transition-all hover:shadow-md">
                {/* Left Stripe */}
                <div className="w-4 bg-status-info shrink-0"></div>

                <div className="p-4 flex-1 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-status-info/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-status-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-status-info uppercase tracking-wider mb-1 flex items-center justify-between">
                            Action
                            {(!data.isConfigured && data.label !== 'Action') && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                        </div>
                        <div className="text-sm font-bold text-text-primary truncate">{data.label || 'Select Action'}</div>

                        {data.configSummary ? (
                            <div className="mt-2 text-xs bg-status-info/5 rounded p-2 text-text-secondary border border-status-info/10 space-y-1">
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
            </div>

            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-status-info border-2 border-white" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-status-info border-2 border-white" />

            <AddBlockMenu sourceId={id} />
        </div>
    );
}
