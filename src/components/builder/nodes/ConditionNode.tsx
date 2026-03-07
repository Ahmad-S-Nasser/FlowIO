import { Handle, Position } from '@xyflow/react';
import { GitBranch, AlertTriangle } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function ConditionNode({ id, data }: any) {
    return (
        <div className="relative group font-sans">
            <div className="w-[320px] drop-shadow-sm hover:drop-shadow-md transition-all">
                {/* Border Wrapper */}
                <div className="clip-hexagon bg-border p-[1px]">
                    <div className="clip-hexagon bg-white flex items-stretch min-h-[100px]">
                        {/* Left Stripe */}
                        <div className="w-8 flex shrink-0 bg-status-warning"></div>

                        <div className="p-4 pl-2 flex-1 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-status-warning/10 flex items-center justify-center shrink-0">
                                <GitBranch className="w-5 h-5 text-status-warning" />
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="text-xs font-bold text-status-warning uppercase tracking-wider mb-1 flex items-center justify-between">
                                    Condition
                                    {(!data.isConfigured && data.label !== 'If / Else') && <AlertTriangle className="w-3 h-3 text-status-error" />}
                                </div>
                                <div className="text-sm font-bold text-text-primary truncate">{data.label || 'If / Else'}</div>

                                {data.configSummary ? (
                                    <div className="mt-2 text-xs bg-status-warning/5 rounded p-2 text-text-secondary border border-status-warning/10 space-y-1">
                                        {Object.entries(data.configSummary).map(([k, v]) => (
                                            <div key={k} className="truncate"><span className="font-medium text-text-primary">{k}:</span> {v as React.ReactNode}</div>
                                        ))}
                                    </div>
                                ) : (data.description ? (
                                    <div className="text-xs text-text-secondary mt-1 line-clamp-2">{data.description}</div>
                                ) : (
                                    <div className="text-xs text-status-error mt-1 flex items-center gap-1">
                                        Configuration incomplete
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-status-warning border-2 border-white" />

            {/* True / False labels & Handles */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-10">
                {/* Yes Branch */}
                <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-status-success bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max">Yes</span>
                    <Handle type="source" position={Position.Bottom} id="yes" className="!relative !transform-none !left-auto !bottom-auto w-3 h-3 bg-status-success border-2 border-white translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="yes" /></div>
                </div>

                {/* No Branch */}
                <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-text-secondary bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max">No</span>
                    <Handle type="source" position={Position.Bottom} id="no" className="!relative !transform-none !left-auto !bottom-auto w-3 h-3 bg-status-warning border-2 border-white translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="no" /></div>
                </div>
            </div>
        </div>
    );
}
