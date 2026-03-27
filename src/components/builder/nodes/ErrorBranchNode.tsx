import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function ErrorBranchNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    return (
        <div className="relative group font-sans">
            <div className="w-[320px] bg-white rounded-md shadow-sm border border-border flex items-stretch overflow-hidden transition-all hover:shadow-md">
                {/* Left Stripe */}
                <div className="w-4 bg-status-warning shrink-0"></div>

                <div className="p-4 flex-1 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-status-warning/10 flex items-center justify-center shrink-0">
                        <GitBranch className="w-5 h-5 text-status-warning" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="text-xs font-bold text-status-warning uppercase tracking-wider mb-1 flex items-center justify-between">
                            Logic
                            {!data.isConfigured && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                        </div>
                        <div className="text-sm font-bold text-text-primary truncate">{data.label || 'Error Branch'}</div>

                        {data.configSummary ? (
                            <div className="mt-2 text-xs bg-status-warning/5 rounded p-2 text-text-secondary border border-status-warning/10 space-y-1">
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

            <Handle type="target" position={Position.Top} className="handle-default" />

            <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2 gap-4">
                <div className="relative flex-1 flex flex-col items-center">
                    <span className="text-xs font-bold text-status-error bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max truncate">On Error</span>
                    <Handle type="source" position={Position.Bottom} id="on_error" className="!relative !transform-none !left-auto !bottom-auto handle-error translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="on_error" /></div>
                </div>
                <div className="relative flex-1 flex flex-col items-center">
                    <span className="text-xs font-bold text-status-success bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max truncate">On Success</span>
                    <Handle type="source" position={Position.Bottom} id="on_success" className="!relative !transform-none !left-auto !bottom-auto handle-success translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="on_success" /></div>
                </div>
            </div>
        </div>
    );
}
