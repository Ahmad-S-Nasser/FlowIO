import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dagre from 'dagre';
import { ArrowLeft, Play, CheckCircle2, Loader2, Zap, Calendar, FileText, Database, AlertTriangle, Mail, CheckSquare, Split, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Connection, Edge, Node } from '@xyflow/react';
import type { AIGeneratedFlow } from '../lib/aiGenerator';
import { generateFlowFromPrompt as genFlow } from '../lib/aiGenerator';
import { TriggerNode } from '../components/builder/nodes/TriggerNode';
import { ActionNode } from '../components/builder/nodes/ActionNode';
import { ConditionNode } from '../components/builder/nodes/ConditionNode';
import { ToolActionNode } from '../components/builder/nodes/ToolActionNode';
import { ToolTriggerNode } from '../components/builder/nodes/ToolTriggerNode';
import { UtilityNode } from '../components/builder/nodes/UtilityNode';
import { AIPromptModal } from '../components/builder/AIPromptModal';
import { IN_MEMORY_INTEGRATIONS, getToolActionById, getToolTriggerById } from '../lib/integrations';
import { mockTemplateFlows } from '../lib/mock';

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    tool: ToolActionNode,
    tool_trigger: ToolTriggerNode,
    utility: UtilityNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 300, height: 100 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 150,
                y: nodeWithPosition.y - 50,
            },
        };
    });
};

let idCtr = 1;
const getId = () => `${idCtr++}`;

function BuilderFlow() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { setCenter } = useReactFlow();

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testState, setTestState] = useState<'idle' | 'running' | 'success'>('idle');
    const [workflowStatus, setWorkflowStatus] = useState<'Draft' | 'Active'>('Draft');

    // AI Assistant State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Variable Insert State
    const [insertVariableField, setInsertVariableField] = useState<string | null>(null);

    const availableVariables = [
        { id: '{{trigger.email}}', label: 'Trigger: Email Address' },
        { id: '{{trigger.name}}', label: 'Trigger: Full Name' },
        { id: '{{trigger.company}}', label: 'Trigger: Company' },
        { id: '{{action.status}}', label: 'Previous Step: Status' }
    ];

    const invalidNodes = nodes.filter(n => n.data.isConfigured === false);

    const focusNode = (node: Node) => {
        setSelectedNode(node);
        // node.position is top-left, center it
        setCenter(node.position.x + 150, node.position.y + 50, { zoom: 1, duration: 800 });
    };

    useEffect(() => {
        if (nodes.length > 0) {
            const layoutedNodes = getLayoutedElements(nodes, edges);
            const hasChanged = layoutedNodes.some((n, i) => Math.abs(n.position.x - nodes[i]?.position.x) > 1 || Math.abs(n.position.y - nodes[i]?.position.y) > 1);
            if (hasChanged) {
                setNodes(layoutedNodes);
            }
        }
    }, [nodes.length, edges.length, setNodes]);

    // Initialize from template if present
    useEffect(() => {
        const templateId = searchParams.get('template');
        if (templateId && mockTemplateFlows[templateId]) {
            const flow = mockTemplateFlows[templateId];
            setNodes(flow.nodes);
            setEdges(flow.edges);
        }
    }, [searchParams, setNodes, setEdges]);

    const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const runTestSimulation = () => {
        setTestState('running');
        setTimeout(() => {
            setTestState('success');
        }, 2000); // simulate 2s runtime
    };

    const addInitialNode = (type: string, label: string) => {
        const newNode: Node = {
            id: getId(),
            type,
            position: { x: 250, y: 100 },
            data: { label, description: 'Configure this node in the right panel.', isConfigured: type.includes('trigger') },
        };
        setNodes((nds) => nds.concat(newNode));
        setSelectedNode(newNode);
    };

    const handleAIGeneration = async (prompt: string) => {
        const flow: AIGeneratedFlow = await genFlow(prompt);
        // We replace the current nodes completely if it was empty, or we could append. 
        // For MVPs, full replacement + auto-layout works best.
        setNodes(flow.nodes);
        setEdges(flow.edges);

        // Dagre layout will run automatically because nodes.length goes from 0 to N
        // and we have a useEffect depending on nodes/edges.
        // We ensure we select the trigger node by default
        const trigger = flow.nodes.find(n => n.type === 'trigger');
        if (trigger) {
            setSelectedNode(trigger);
        }
    };

    const updateSelectedNodeData = (updates: any) => {
        if (!selectedNode) return;

        const applyUpdates = (node: Node) => {
            const newData = { ...node.data, ...updates };

            let isConfigured = false;
            let configSummary: Record<string, string> = {};

            if (node.type === 'action' && newData.label === 'Send Email') {
                isConfigured = !!(newData.recipient && newData.subject);
                if (newData.recipient) configSummary['To'] = newData.recipient;
                if (newData.subject) configSummary['Subject'] = newData.subject;
            } else if (node.type === 'action' && newData.label === 'Create Task') {
                isConfigured = !!newData.taskTitle;
                if (newData.taskTitle) configSummary['Task'] = newData.taskTitle;
            } else if (node.type === 'condition') {
                isConfigured = !!(newData.field && newData.operator && newData.value);
                if (newData.field) configSummary['If'] = newData.field;
                if (newData.operator) configSummary['Is'] = newData.operator;
                if (newData.value) configSummary['Value'] = newData.value;
            } else if (node.type === 'utility') {
                if (newData.label === 'Retry Step') {
                    isConfigured = !!newData.attempts;
                    if (newData.attempts) configSummary['Retries'] = newData.attempts;
                } else if (newData.label === 'On Error') {
                    isConfigured = !!newData.action;
                    if (newData.action) configSummary['Action'] = newData.action;
                }
            } else if (node.type === 'tool' || node.type === 'tool_trigger') {
                const schemaDef = node.type === 'tool'
                    ? getToolActionById(newData.actionId)
                    : getToolTriggerById(newData.triggerId);

                // Assume configured if all required fields are present in newData.config
                isConfigured = true;
                const configValues = newData.config || {};

                if (schemaDef) {
                    schemaDef.fields.forEach(field => {
                        if (field.required && !configValues[field.name]) {
                            isConfigured = false;
                        }
                        if (configValues[field.name]) {
                            configSummary[field.label] = configValues[field.name];
                        }
                    });
                }
            } else if (node.type === 'trigger') {
                isConfigured = true; // Triggers basic config
            }

            if (Object.keys(configSummary).length > 0) {
                newData.configSummary = configSummary;
            } else {
                delete newData.configSummary;
            }
            newData.isConfigured = isConfigured;

            return { ...node, data: newData };
        };

        setNodes(nds => nds.map(n => n.id === selectedNode.id ? applyUpdates(n) : n));
        setSelectedNode(n => n ? applyUpdates(n) : null);
    };

    const updateToolConfig = (key: string, value: string) => {
        if (!selectedNode) return;
        const currentConfig = selectedNode.data.config as Record<string, string> || {};
        updateSelectedNodeData({ config: { ...currentConfig, [key]: value } });
    };

    const handleInsertVariable = (fieldKey: string, varId: string) => {
        if (!selectedNode) return;
        const currentConfig = selectedNode.data.config as Record<string, string> || {};
        const currentVal = currentConfig[fieldKey] || '';
        const newVal = currentVal + (currentVal.endsWith(' ') || currentVal === '' ? '' : ' ') + varId;
        updateSelectedNodeData({ config: { ...currentConfig, [fieldKey]: newVal } });
        setInsertVariableField(null);
    };

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, toolIdPayload?: { actionId?: string, triggerId?: string }) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label, ...toolIdPayload }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            const payloadStr = event.dataTransfer.getData('application/reactflow');

            if (!payloadStr || !reactFlowBounds) return;

            const { type, label, actionId, triggerId } = JSON.parse(payloadStr);

            const position = {
                x: event.clientX - reactFlowBounds.left - 150, // center the node
                y: event.clientY - reactFlowBounds.top - 40,
            };

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: {
                    label,
                    description: 'Configure this node in the right panel.',
                    isConfigured: type === 'trigger', // Standard triggers are simple, tools aren't
                    actionId: actionId || null,
                    triggerId: triggerId || null,
                    config: {}
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setSelectedNode(newNode);
        },
        [setNodes]
    );

    return (
        <div className="h-screen w-screen flex flex-col bg-background">
            {/* Builder Topbar */}
            <header className="h-14 border-b border-border bg-white px-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/workflows')} className="p-2 -ml-2 text-text-secondary hover:bg-background-canvas rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-text-primary">{id === 'new' ? 'Untitled Workflow' : 'Lead Follow-up'}</h1>
                            <Badge variant={workflowStatus === 'Draft' ? 'default' : 'success'}>{workflowStatus}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary border-none shadow-none font-bold hidden sm:flex"
                        onClick={() => setIsAIModalOpen(true)}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Ask AI
                    </Button>
                    <div className="w-px h-6 bg-border hidden sm:block mx-1"></div>
                    <Button variant="ghost" size="sm" onClick={() => { setIsTestModalOpen(true); setTestState('idle'); }}>
                        <Play className="w-4 h-4 mr-2" />
                        Test
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setWorkflowStatus('Draft')}>
                        Save Draft
                    </Button>
                    <Button
                        size="sm"
                        disabled={invalidNodes.length > 0 || nodes.length === 0}
                        onClick={() => setWorkflowStatus('Active')}
                    >
                        Publish
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Node Library */}
                <aside className="w-64 bg-white border-r border-border flex flex-col shrink-0 z-10 shadow-sm">
                    <div className="p-4 border-b border-border font-medium text-sm text-text-secondary uppercase tracking-wider">
                        Blocks Library
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-text-primary mb-3">Triggers</h3>
                            <div className="space-y-2">
                                <div
                                    className="p-2 bg-white border border-border rounded-full border-l-4 border-l-status-success cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'trigger', 'Form Submitted')} draggable
                                >
                                    <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-status-success" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Form Submitted</span>
                                </div>
                                <div
                                    className="p-2 bg-white border border-border rounded-full border-l-4 border-l-status-success cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'trigger', 'Schedule')} draggable
                                >
                                    <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4 text-status-success" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Schedule</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary mb-3">Logic</h3>
                            <div className="space-y-2">
                                <div
                                    className="p-2 bg-white border border-border rounded-md cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 relative overflow-hidden drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'condition', 'Condition')} draggable
                                >
                                    {/* Simulated hexagon edge for sidebar styling */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-warning" />
                                    <div className="w-8 h-8 rounded-md bg-status-warning/10 flex items-center justify-center shrink-0 z-10 border border-status-warning/20">
                                        <Split className="w-4 h-4 text-status-warning" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2 z-10">Condition</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary mb-3">Actions</h3>
                            <div className="space-y-2">
                                <div
                                    className="p-2 bg-white border border-border rounded-md border-l-4 border-l-status-info cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'action', 'Send Email')} draggable
                                >
                                    <div className="w-8 h-8 rounded-md bg-status-info/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-status-info" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Send Email</span>
                                </div>
                                <div
                                    className="p-2 bg-white border border-border rounded-md border-l-4 border-l-status-info cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'action', 'Create Task')} draggable
                                >
                                    <div className="w-8 h-8 rounded-md bg-status-info/10 flex items-center justify-center shrink-0">
                                        <CheckSquare className="w-4 h-4 text-status-info" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Create Task</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-text-primary mb-3">Error & Utility</h3>
                            <div className="space-y-2">
                                <div
                                    className="p-2 bg-white border border-border rounded-md border-l-4 border-l-status-error cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'utility', 'On Error')} draggable
                                >
                                    <div className="w-8 h-8 rounded-md bg-status-error/10 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-status-error" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Error Branch</span>
                                </div>
                                <div
                                    className="p-2 bg-white border border-border rounded-md border-l-4 border-l-status-info cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm"
                                    onDragStart={(e) => onDragStart(e, 'utility', 'Retry Step')} draggable
                                >
                                    <div className="w-8 h-8 rounded-md bg-status-info/10 flex items-center justify-center shrink-0">
                                        <RotateCw className="w-4 h-4 text-status-info" />
                                    </div>
                                    <span className="text-sm font-medium text-text-primary pr-2">Retry Step</span>
                                </div>
                            </div>
                        </div>

                        {/* Connected Tools Library */}
                        <div className="pt-2">
                            <h3 className="text-sm font-bold text-text-primary mb-3">Tools</h3>
                            <div className="space-y-4">
                                {IN_MEMORY_INTEGRATIONS.map(tool => {
                                    const Icon = tool.icon;
                                    // For MVP, show all tools or just connected ones
                                    if (tool.status !== 'connected') return null;

                                    return (
                                        <div key={tool.id} className="space-y-2">
                                            <div className="flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-text-muted">
                                                <Icon className="w-3 h-3" />
                                                {tool.name}
                                            </div>
                                            {tool.triggers && tool.triggers.length > 0 && (
                                                <div className="mb-2">
                                                    <span className="text-[10px] text-text-muted font-medium mb-1 inline-block uppercase tracking-wide">Triggers</span>
                                                    {tool.triggers.map(trigger => (
                                                        <div
                                                            key={trigger.id}
                                                            className="p-2 bg-white border border-border rounded-full border-l-4 cursor-grab hover:shadow-md transition-shadow flex items-center gap-2 drop-shadow-sm mb-1 line-clamp-1"
                                                            style={{ borderLeftColor: tool.color }}
                                                            onDragStart={(e) => onDragStart(e, 'tool_trigger', trigger.name, { triggerId: trigger.id })} draggable
                                                        >
                                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: tool.color }}>
                                                                <Icon className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-sm font-medium text-text-primary pr-2">{trigger.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {tool.actions && tool.actions.length > 0 && (
                                                <div>
                                                    <span className="text-[10px] text-text-muted font-medium mb-1 inline-block uppercase tracking-wide">Actions</span>
                                                    {tool.actions.map(action => (
                                                        <div
                                                            key={action.id}
                                                            className="p-2 bg-white border border-border rounded-md cursor-grab hover:shadow-md transition-shadow flex items-center gap-3 drop-shadow-sm relative overflow-hidden mb-1"
                                                            onDragStart={(e) => onDragStart(e, 'tool', action.name, { actionId: action.id })} draggable
                                                        >
                                                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: tool.color }} />
                                                            <div className="w-8 h-8 pl-1 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: tool.color }}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-sm font-medium text-text-primary pr-2">{action.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {IN_MEMORY_INTEGRATIONS.every(t => t.status !== 'connected') && (
                                    <div className="text-xs text-text-secondary italic text-center py-4 bg-background-canvas rounded-card border border-border">
                                        No tools connected. Go to Integrations to connect apps.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </aside>

                {/* Center Canvas */}
                <main className="flex-1 h-full w-full relative bg-background-canvas" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        fitView
                        className="bg-background-canvas"
                    >
                        <Background gap={24} size={2} color="#D1D5DB" />
                        <Controls showInteractive={false} className="border-border shadow-soft rounded-lg overflow-hidden" />

                        {nodes.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="bg-white p-8 rounded-card shadow-lg border border-border flex flex-col items-center text-center max-w-sm pointer-events-auto">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Zap className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-text-primary mb-2">Start with a Trigger</h2>
                                    <p className="text-text-secondary text-sm mb-6">Choose an event that will start your workflow. You can drag a block from the library or choose one below.</p>
                                    <div className="w-full space-y-2">
                                        <button className="w-full flex items-center gap-3 p-3 border border-border rounded-btn hover:border-primary hover:bg-primary/5 transition-colors text-left" onClick={() => addInitialNode('trigger', 'Schedule')}>
                                            <div className="w-8 h-8 rounded bg-status-success/10 flex flex-shrink-0 items-center justify-center text-status-success"><Calendar className="w-4 h-4" /></div>
                                            <span className="font-medium text-sm text-text-primary">Schedule</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-3 border border-border rounded-btn hover:border-primary hover:bg-primary/5 transition-colors text-left" onClick={() => addInitialNode('trigger', 'Form Submitted')}>
                                            <div className="w-8 h-8 rounded bg-status-success/10 flex flex-shrink-0 items-center justify-center text-status-success"><FileText className="w-4 h-4" /></div>
                                            <span className="font-medium text-sm text-text-primary">Form Submitted</span>
                                        </button>
                                        <button className="w-full flex items-center gap-3 p-3 border border-border rounded-btn hover:border-primary hover:bg-primary/5 transition-colors text-left" onClick={() => addInitialNode('trigger', 'Record Created')}>
                                            <div className="w-8 h-8 rounded bg-status-success/10 flex flex-shrink-0 items-center justify-center text-status-success"><Database className="w-4 h-4" /></div>
                                            <span className="font-medium text-sm text-text-primary">Record Created</span>
                                        </button>
                                    </div>

                                    {/* AI Generate Separator */}
                                    <div className="relative py-4 flex items-center justify-center w-full max-w-sm">
                                        <div className="absolute inset-x-0 top-1/2 h-px bg-border -translate-y-1/2"></div>
                                        <span className="relative bg-background-canvas px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">OR</span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full max-w-sm bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover border-none text-white shadow-xl shadow-primary/20 h-14"
                                        onClick={() => setIsAIModalOpen(true)}
                                    >
                                        <Sparkles className="w-5 h-5 mr-3" />
                                        Generate with AI
                                    </Button>

                                </div>
                            </div>
                        )}

                        <Controls className="border-border shadow-soft rounded-lg overflow-hidden" />

                    </ReactFlow>

                    {/* Bottom Validation Bar */}
                    {(invalidNodes.length > 0 && nodes.length > 0) && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-status-warning shadow-xl rounded-card p-4 w-[400px] z-[60]">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <AlertTriangle className="w-5 h-5 text-status-warning" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-text-primary mb-1">
                                        {invalidNodes.length} {invalidNodes.length === 1 ? 'issue needs' : 'issues need'} attention
                                    </h4>
                                    <ul className="space-y-1 mt-2">
                                        {invalidNodes.map(n => (
                                            <li key={n.id}>
                                                <button
                                                    className="text-xs text-status-warning hover:underline text-left block w-full focus:outline-none"
                                                    onClick={() => focusNode(n)}
                                                >
                                                    • {n.data.label as string}: configuration missing
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Sidebar - Properties Panel */}
                <aside className="w-80 bg-white border-l border-border flex flex-col shrink-0 z-10 shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                    <div className="p-4 border-b border-border font-medium text-sm text-text-secondary uppercase tracking-wider">
                        Configuration
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {!selectedNode ? (
                            <div className="flex flex-col items-center justify-center text-center p-6 h-full">
                                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-3">
                                    <span className="text-text-secondary text-xl">👆</span>
                                </div>
                                <p className="text-text-secondary text-sm">Select a block on the canvas to configure its properties.</p>
                            </div>
                        ) : (
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary">{selectedNode.data.label as string}</h3>
                                    <p className="text-text-secondary text-sm mt-1">Configure the settings for this step.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Label</label>
                                        <Input
                                            value={selectedNode.data.label as string}
                                            onChange={(e) => updateSelectedNodeData({ label: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-primary">Description</label>
                                        <Input
                                            value={selectedNode.data.description as string || ''}
                                            onChange={(e) => updateSelectedNodeData({ description: e.target.value })}
                                        />
                                    </div>

                                    {/* Trigger Node Fields */}
                                    {selectedNode.type === 'trigger' && selectedNode.data.label === 'Schedule' && (
                                        <>
                                            <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                <label className="text-sm font-medium text-text-primary">Recurrence</label>
                                                <select
                                                    className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                    value={selectedNode.data.recurrence as string || 'daily'}
                                                    onChange={e => updateSelectedNodeData({ recurrence: e.target.value })}
                                                >
                                                    <option value="hourly">Hourly</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </select>
                                            </div>
                                            {selectedNode.data.recurrence === 'hourly' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Every X Hours</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={24}
                                                        value={selectedNode.data.hoursInterval as string || '1'}
                                                        onChange={e => updateSelectedNodeData({ hoursInterval: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {selectedNode.data.recurrence === 'weekly' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Day of Week</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.dayOfWeek as string || 'monday'}
                                                        onChange={e => updateSelectedNodeData({ dayOfWeek: e.target.value })}
                                                    >
                                                        <option value="monday">Monday</option>
                                                        <option value="tuesday">Tuesday</option>
                                                        <option value="wednesday">Wednesday</option>
                                                        <option value="thursday">Thursday</option>
                                                        <option value="friday">Friday</option>
                                                        <option value="saturday">Saturday</option>
                                                        <option value="sunday">Sunday</option>
                                                    </select>
                                                </div>
                                            )}

                                            {selectedNode.data.recurrence === 'monthly' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Day of Month</label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={31}
                                                        value={selectedNode.data.dayOfMonth as string || '1'}
                                                        onChange={e => updateSelectedNodeData({ dayOfMonth: e.target.value })}
                                                        placeholder="1-31"
                                                    />
                                                </div>
                                            )}

                                            {selectedNode.data.recurrence !== 'hourly' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Time of Day</label>
                                                    <Input
                                                        type="time"
                                                        value={selectedNode.data.time as string || '09:00'}
                                                        onChange={e => updateSelectedNodeData({ time: e.target.value })}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {selectedNode.type === 'trigger' && selectedNode.data.label === 'Form Submitted' && (
                                        <>
                                            <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                <label className="text-sm font-medium text-text-primary">Form Source</label>
                                                <select
                                                    className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                    value={selectedNode.data.formId as string || ''}
                                                    onChange={e => updateSelectedNodeData({ formId: e.target.value })}
                                                >
                                                    <option value="">Select form...</option>
                                                    <option value="contactUs">Contact Us (Website)</option>
                                                    <option value="newsletter">Newsletter Signup</option>
                                                    <option value="support">Support Request</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-text-primary">Trigger Event</label>
                                                <select
                                                    className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                    value={selectedNode.data.triggerEvent as string || 'any'}
                                                    onChange={e => updateSelectedNodeData({ triggerEvent: e.target.value })}
                                                >
                                                    <option value="any">Any submission</option>
                                                    <option value="specific">Contains specific label/value</option>
                                                </select>
                                            </div>
                                            {selectedNode.data.triggerEvent === 'specific' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Match Label/Value</label>
                                                    <Input
                                                        value={selectedNode.data.matchValue as string || ''}
                                                        onChange={e => updateSelectedNodeData({ matchValue: e.target.value })}
                                                        placeholder="e.g. Urgent"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {selectedNode.type === 'trigger' && selectedNode.data.label === 'Record Created' && (
                                        <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                            <label className="text-sm font-medium text-text-primary">Database / Table</label>
                                            <select
                                                className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                value={selectedNode.data.table as string || ''}
                                                onChange={e => updateSelectedNodeData({ table: e.target.value })}
                                            >
                                                <option value="">Select table...</option>
                                                <option value="users">Users</option>
                                                <option value="orders">Orders</option>
                                                <option value="invoices">Invoices</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Action Node Fields */}
                                    {selectedNode.type === 'action' && selectedNode.data.label === 'Send Email' && (
                                        <>
                                            <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                <label className="text-sm font-medium text-text-primary flex justify-between">
                                                    To
                                                    <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ recipient: '{{customer.email}}' })}>Insert Variable</button>
                                                </label>
                                                <Input
                                                    value={selectedNode.data.recipient as string || ''}
                                                    onChange={e => updateSelectedNodeData({ recipient: e.target.value })}
                                                    placeholder="example@email.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-text-primary">Subject</label>
                                                <Input
                                                    value={selectedNode.data.subject as string || ''}
                                                    onChange={e => updateSelectedNodeData({ subject: e.target.value })}
                                                    placeholder="Welcome!"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Condition Node Fields */}
                                    {selectedNode.type === 'condition' && (
                                        <>
                                            <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                <label className="text-sm font-medium text-text-primary flex justify-between">
                                                    Field
                                                    <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ field: '{{order.total}}' })}>Insert Variable</button>
                                                </label>
                                                <Input
                                                    value={selectedNode.data.field as string || ''}
                                                    onChange={e => updateSelectedNodeData({ field: e.target.value })}
                                                    placeholder="e.g. Total Amount"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-text-primary">Condition</label>
                                                <select
                                                    className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                    value={selectedNode.data.operator as string || ''}
                                                    onChange={e => updateSelectedNodeData({ operator: e.target.value })}
                                                >
                                                    <option value="">Select operator...</option>
                                                    <option value=">">Greater than</option>
                                                    <option value="<">Less than</option>
                                                    <option value="==">Equals</option>
                                                    <option value="contains">Contains</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-text-primary">Value</label>
                                                <Input
                                                    value={selectedNode.data.value as string || ''}
                                                    onChange={e => updateSelectedNodeData({ value: e.target.value })}
                                                    placeholder="500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Utility Node Fields */}
                                    {selectedNode.type === 'utility' && selectedNode.data.label === 'Retry Step' && (
                                        <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                            <label className="text-sm font-medium text-text-primary">Max attempts</label>
                                            <Input
                                                type="number"
                                                value={selectedNode.data.attempts as string || ''}
                                                onChange={e => updateSelectedNodeData({ attempts: e.target.value })}
                                                placeholder="3"
                                            />
                                        </div>
                                    )}
                                    {selectedNode.type === 'utility' && selectedNode.data.label === 'On Error' && (
                                        <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                            <label className="text-sm font-medium text-text-primary">Action to take</label>
                                            <select
                                                className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                value={selectedNode.data.action as string || ''}
                                                onChange={e => updateSelectedNodeData({ action: e.target.value })}
                                            >
                                                <option value="">Select action...</option>
                                                <option value="Stop Flow">Stop Flow</option>
                                                <option value="Continue">Continue</option>
                                                <option value="Send Alert">Send Alert</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Tool Action & Trigger Node Fields */}
                                    {['tool', 'tool_trigger'].includes(selectedNode.type!) && (() => {
                                        let schemaDef;
                                        if (selectedNode.type === 'tool') {
                                            schemaDef = getToolActionById(selectedNode.data.actionId as string);
                                        } else {
                                            schemaDef = getToolTriggerById(selectedNode.data.triggerId as string);
                                        }

                                        const config = selectedNode.data.config as Record<string, string> || {};
                                        if (!schemaDef) return null;

                                        return (
                                            <>
                                                {schemaDef.fields.map((field) => (
                                                    <div key={field.name} className="space-y-2 mt-4 pt-4 border-t border-border">
                                                        <div className="relative flex items-center justify-between">
                                                            <label className="text-sm font-medium text-text-primary">
                                                                {field.label} {field.required && <span className="text-status-error">*</span>}
                                                            </label>
                                                            {/* We only show Insert Variable if it's an action, triggers usually receive initial data, not dynamic mapped data */}
                                                            {selectedNode.type === 'tool' && (
                                                                <div className="relative">
                                                                    <button
                                                                        className="text-xs text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded"
                                                                        onClick={() => setInsertVariableField(insertVariableField === field.name ? null : field.name)}
                                                                    >
                                                                        {insertVariableField === field.name ? 'Cancel' : 'Insert Variable'}
                                                                    </button>

                                                                    {insertVariableField === field.name && (
                                                                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-border shadow-soft rounded-lg z-[100] overflow-hidden">
                                                                            <div className="px-3 py-2 bg-background-canvas border-b border-border text-[10px] uppercase font-bold tracking-wider text-text-muted">
                                                                                Available Data
                                                                            </div>
                                                                            <div className="max-h-48 overflow-y-auto">
                                                                                {availableVariables.map(v => (
                                                                                    <button
                                                                                        key={v.id}
                                                                                        onClick={() => handleInsertVariable(field.name, v.id)}
                                                                                        className="w-full text-left px-3 py-2.5 text-xs text-text-primary hover:bg-primary/5 border-b border-border/50 last:border-0 transition-colors flex flex-col gap-0.5"
                                                                                    >
                                                                                        <span className="font-medium text-text-primary truncate">{v.label}</span>
                                                                                        <span className="text-text-muted font-mono text-[10px] truncate">{v.id}</span>
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {field.type === 'select' ? (
                                                            <select
                                                                className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                                value={config[field.name] || ''}
                                                                onChange={e => updateToolConfig(field.name, e.target.value)}
                                                            >
                                                                <option value="">Select option...</option>
                                                                {field.options?.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <Input
                                                                value={config[field.name] || ''}
                                                                onChange={e => updateToolConfig(field.name, e.target.value)}
                                                                placeholder={field.placeholder || ''}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Test Workflow">
                {testState === 'idle' ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-text-secondary">Run a simulation of your workflow to verify it works correctly before activating.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-text-primary text-sm">Trigger Payload (Mock)</h3>
                            <div className="bg-background-canvas border border-border rounded-btn p-4 font-mono text-xs text-text-secondary whitespace-pre overflow-x-auto">
                                {`{
  "lead": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "company": "Acme Corp",
    "score": 85
  }
}`}
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
                            <Button onClick={runTestSimulation}>Run Simulation</Button>
                        </div>
                    </div>
                ) : testState === 'running' ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="font-medium text-text-primary">Executing workflow steps...</p>
                        <p className="text-sm text-text-secondary mt-1">This may take a moment</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center p-4 bg-status-success/10 rounded-card border border-status-success/20 mb-6">
                            <div className="flex items-center gap-2 text-status-success">
                                <CheckCircle2 className="w-6 h-6" />
                                <span className="font-bold">Test Completed Successfully</span>
                            </div>
                        </div>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {nodes.map((node, i) => (
                                <div key={node.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-status-success/20 text-status-success font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>

                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-card shadow-sm border border-border">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-text-primary text-sm">{node.data.label as string}</span>
                                            <span className="text-xs font-mono text-text-secondary">{i * 250}ms</span>
                                        </div>
                                        <div className="text-text-secondary text-xs">Executed successfully</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end">
                            <Button onClick={() => setIsTestModalOpen(false)}>Done</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* AI Prompt Modal */}
            <AIPromptModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGeneration}
            />
        </div>
    );
}

export function Builder() {
    return (
        <ReactFlowProvider>
            <BuilderFlow />
        </ReactFlowProvider>
    );
}
