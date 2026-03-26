import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Repeat, AlertTriangle, X } from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

export function LoopNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();

    return (
        <div className="relative group font-sans">
            <div className="w-[320px] drop-shadow-sm hover:drop-shadow-md transition-all">
                {/* Border Wrapper */}
                <div className="clip-hexagon bg-border p-[1px]">
                    <div className="clip-hexagon bg-white flex items-stretch min-h-[100px]">
                        {/* Left Stripe */}
                        <div className="w-8 flex shrink-0 bg-status-info"></div>

                        <div className="p-4 pl-2 flex-1 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-status-info/10 flex items-center justify-center shrink-0">
                                <Repeat className="w-5 h-5 text-status-info" />
                            </div>
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="text-xs font-bold text-status-info uppercase tracking-wider mb-1 flex items-center justify-between">
                                    Loop
                                    {(!data.isConfigured && data.label !== 'For Each') && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                                </div>
                                <div className="text-sm font-bold text-text-primary truncate">{data.label || 'For Each'}</div>

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

                        {/* Delete Button */}
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
                </div>
            </div>

            <Handle type="target" position={Position.Top} className="handle-info" />

            {/* Loop branches */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-10">
                {/* Item Branch */}
                <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-status-info bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max">Item</span>
                    <Handle type="source" position={Position.Bottom} id="loop" className="!relative !transform-none !left-auto !bottom-auto handle-info translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="loop" /></div>
                </div>

                {/* Done Branch */}
                <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-text-secondary bg-white px-3 py-0.5 rounded-full border border-border shadow-sm translate-y-2 z-10 w-max">Done</span>
                    <Handle type="source" position={Position.Bottom} id="done" className="!relative !transform-none !left-auto !bottom-auto handle-default translate-y-2 z-0" />
                    <div className="absolute top-full mt-4"><AddBlockMenu sourceId={id} branch="done" /></div>
                </div>
            </div>
        </div>
    );
}
