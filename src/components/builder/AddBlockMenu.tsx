import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Mail, CheckSquare, Split } from 'lucide-react';

export function AddBlockMenu({ sourceId, branch }: { sourceId: string, branch?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { setNodes, setEdges, getNodes } = useReactFlow();

    const handleAdd = (e: React.MouseEvent, type: string, label: string) => {
        e.stopPropagation();
        const nodes = getNodes();
        const sourceNode = nodes.find(n => n.id === sourceId);
        if (!sourceNode) return;

        const position = { x: sourceNode.position.x, y: sourceNode.position.y + 150 };
        const isTrigger = type === 'trigger';

        const newNode = {
            id: `node-${Date.now()}`,
            type,
            position,
            data: { label, description: 'Configure this node in the right panel.', isConfigured: isTrigger }
        };

        const sourceHandle = branch ? branch : (sourceNode.type === 'condition' ? 'yes' : undefined);

        setNodes(nds => nds.concat(newNode));
        setEdges(eds => eds.concat({
            id: `e-${sourceId}${sourceHandle ? `-${sourceHandle}` : ''}-${newNode.id}`,
            source: sourceId,
            target: newNode.id,
            sourceHandle,
            type: 'smoothstep',
            animated: true
        }));

        setIsOpen(false);
    };

    return (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center group/menu">
            <button
                className={`w-8 h-8 bg-white border shadow-sm rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary hover:shadow-md transition-all ${isOpen ? 'border-primary text-primary opacity-100 scale-110' : 'border-border opacity-0 group-hover:opacity-100'}`}
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                title="Add next step"
            >
                +
            </button>

            {isOpen && (
                <div className="absolute top-10 w-56 bg-white border border-border shadow-xl rounded-card overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="p-3 border-b border-border bg-background-canvas text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Add Next Step
                    </div>
                    <div className="p-2 space-y-1">
                        <button className="w-full flex items-center gap-3 p-2 hover:bg-background-canvas rounded-btn transition-colors text-left" onClick={(e) => handleAdd(e, 'action', 'Send Email')}>
                            <div className="w-6 h-6 rounded bg-status-info/10 flex items-center justify-center shrink-0"><Mail className="w-3 h-3 text-status-info" /></div>
                            <span className="text-sm font-medium text-text-primary">Send Email</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2 hover:bg-background-canvas rounded-btn transition-colors text-left" onClick={(e) => handleAdd(e, 'action', 'Create Task')}>
                            <div className="w-6 h-6 rounded bg-status-info/10 flex items-center justify-center shrink-0"><CheckSquare className="w-3 h-3 text-status-info" /></div>
                            <span className="text-sm font-medium text-text-primary">Create Task</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-2 hover:bg-background-canvas rounded-btn transition-colors text-left" onClick={(e) => handleAdd(e, 'condition', 'Condition')}>
                            <div className="w-6 h-6 rounded bg-status-warning/10 flex items-center justify-center shrink-0"><Split className="w-3 h-3 text-status-warning" /></div>
                            <span className="text-sm font-medium text-text-primary">Condition</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
