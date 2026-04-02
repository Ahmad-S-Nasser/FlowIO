import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import dagre from 'dagre';
import { Trash2, Download, Upload, ArrowLeft, Play, Plus, Minus, Maximize, X, CheckCircle2, Loader2, Zap, Calendar, FileText, Database, AlertTriangle, Mail, CheckSquare, Split, Sparkles, RotateCw, UserCheck, Edit, Bell, Clock, Repeat, Network, Wand2, Code, ShieldAlert, Search, Layers, GitBranch, Brain, FileSearch, MessageCircle, Globe, MailSearch, Star, ListOrdered, Tags, Smile, Mic, Volume2, UserCircle, HeartPulse, ScanFace, Ear, Link2, ToggleRight, AlignJustify, Combine, ChevronRight, GitFork, Eye, Grid, Lock, Unlock, Undo2, Redo2, MousePointer2, Move } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath
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
import { LoopNode } from '../components/builder/nodes/LoopNode';
import { ParallelNode } from '../components/builder/nodes/ParallelNode';
import { TryCatchNode } from '../components/builder/nodes/TryCatchNode';
import { ErrorBranchNode } from '../components/builder/nodes/ErrorBranchNode';
import { AIPromptModal } from '../components/builder/AIPromptModal';
import { IN_MEMORY_INTEGRATIONS, getToolActionById, getToolTriggerById } from '../lib/integrations';
import { mockTemplateFlows, mockWorkflows, mockTemplates } from '../lib/mock';
import { exportFlowToJson, saveFlowToLocal, getFlowFromLocal, type WorkflowSaveData } from '../lib/workflowStorage';

const nodeTypes = {
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    tool: ToolActionNode,
    tool_trigger: ToolTriggerNode,
    utility: UtilityNode,
    loop: LoopNode,
    parallel: ParallelNode,
    trycatch: TryCatchNode,
    error_branch: ErrorBranchNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const MOCK_DATA_SCHEMAS: Record<string, any> = {
  trigger: {
    id: "evt_72190",
    event: "manual_trigger",
    user: { id: "u_982", name: "Ahmad Nasser", role: "admin" },
    timestamp: new Date().toISOString()
  },
  action: {
    status: "success",
    processed_at: new Date().toISOString(),
    result: { id: "res_331", type: "email_sent", recipient: "user@example.com" }
  },
  tool: {
    tool_id: "slack_integration",
    action: "post_message",
    payload: { channel: "#general", text: "Workflow status: Active" }
  },
  llm: {
    model: "gpt-4-turbo",
    response: "The task has been successfully analyzed and categorized.",
    usage: { prompt_tokens: 42, completion_tokens: 12 }
  },
  condition: {
    match: true,
    evaluation_time: "12ms",
    path: "success"
  },
  loop: {
    iteration: 1,
    total_items: 5,
    current_item: { id: "item_1", value: "A" }
  }
};

function CustomEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [isHovered, setIsHovered] = useState(false);
  const { getNode, setEdges } = useReactFlow();

  const getMockData = () => {
    const sourceNode = getNode(source);
    if (!sourceNode) return MOCK_DATA_SCHEMAS.action;
    const label = (sourceNode.data as any).label?.toLowerCase() || '';
    if (label.includes('trigger')) return MOCK_DATA_SCHEMAS.trigger;
    if (label === 'llm' || label === 'rag' || label === 'chatbot') return MOCK_DATA_SCHEMAS.llm;
    if (label === 'condition') return MOCK_DATA_SCHEMAS.condition;
    if (label.includes('loop')) return MOCK_DATA_SCHEMAS.loop;
    return MOCK_DATA_SCHEMAS.action;
  };

  const schema = getMockData();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 3 : 2, stroke: selected ? '#3b82f6' : '#94a3b8' }} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex flex-col items-center gap-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="edge-label relative">
            <Database className="w-2.5 h-2.5 opacity-60" />
            Data
          </div>

          {selected && (
             <button
                className="bg-white border border-status-error text-status-error rounded-full w-5 h-5 flex items-center justify-center shadow-sm hover:bg-status-error hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setEdges((eds) => eds.filter(e => e.id !== id));
                }}
                title="Delete Link"
             >
                <X className="w-3 h-3" />
             </button>
          )}

          {isHovered && !selected && (
            <div className="edge-data-tooltip mt-1">
              <div className="edge-data-header">
                <span>Output Data</span>
                <Eye className="w-2.5 h-2.5 text-primary opacity-70" />
              </div>
              <pre>{JSON.stringify(schema, null, 2)}</pre>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes = {
    custom: CustomEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 60 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 220, height: 80 });
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
    const { setCenter, zoomIn, zoomOut, fitView } = useReactFlow();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Canvas Settings
    const [showGrid, setShowGrid] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [isSelectMode, setIsSelectMode] = useState(false);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // History Context
    const [past, setPast] = useState<{nodes: Node[], edges: Edge[]}[]>([]);
    const [future, setFuture] = useState<{nodes: Node[], edges: Edge[]}[]>([]);

    const takeSnapshot = useCallback(() => {
        setPast(p => [...p, { nodes, edges }].slice(-50)); // Keep last 50 states
        setFuture([]);
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(p => p.slice(0, -1));
        setFuture(f => [{ nodes, edges }, ...f]);
        setNodes(previous.nodes);
        setEdges(previous.edges);
    }, [past, nodes, edges, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture(f => f.slice(1));
        setPast(p => [...p, { nodes, edges }]);
        setNodes(next.nodes);
        setEdges(next.edges);
    }, [future, nodes, edges, setNodes, setEdges]);

    const onNodeDragStart = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    // Sync nodes with lock state
    useEffect(() => {
        setNodes(nds => nds.map(n => ({ ...n, draggable: !isLocked, connectable: !isLocked })));
    }, [isLocked, setNodes]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testState, setTestState] = useState<'idle' | 'running' | 'success'>('idle');
    const [testPayload, setTestPayload] = useState('{\n  "lead": {\n    "name": "Jane Smith",\n    "email": "jane@example.com",\n    "company": "Acme Corp",\n    "score": 85\n  }\n}');
    const [workflowStatus, setWorkflowStatus] = useState<'Draft' | 'Active'>('Draft');
    const [workflowName, setWorkflowName] = useState(id === 'new' ? 'Untitled Workflow' : 'Lead Follow-up');
    const [activeConfigTab, setActiveConfigTab] = useState<'config' | 'preview'>('config');

    // AI Assistant State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    // Sidebar Search State
    const [sidebarSearch, setSidebarSearch] = useState('');

    const filteredGroups = useMemo(() => {
        const q = sidebarSearch.toLowerCase().trim();
        const match = (label: string) => !q || label.toLowerCase().includes(q);

        const triggerNodes = [
            { type: 'trigger', label: 'Manual Trigger', icon: Play, color: 'status-success' },
            { type: 'trigger', label: 'Record Created', icon: Database, color: 'status-success' },
            { type: 'trigger', label: 'Form Submitted', icon: FileText, color: 'status-success' },
            { type: 'trigger', label: 'Schedule', icon: Calendar, color: 'status-success' },
            { type: 'trigger', label: 'Record Deleted', icon: Trash2, color: 'status-success' },
            { type: 'trigger', label: 'Field Updated', icon: Edit, color: 'status-success' },
        ];
        const logicNodes = [
            { type: 'condition', label: 'Condition', icon: Split, color: 'status-warning' },
            { type: 'loop', label: 'For Each Loop', icon: Repeat, color: 'status-info' },
            { type: 'parallel', label: 'Parallel Actions', icon: Network, color: 'status-info' },
        ];
        const actionNodes = [
            { type: 'action', label: 'Send Email', icon: Mail, color: 'status-info' },
            { type: 'action', label: 'Create Task', icon: CheckSquare, color: 'status-info' },
            { type: 'action', label: 'Request Approval', icon: UserCheck, color: 'status-info' },
            { type: 'action', label: 'Update Record', icon: Edit, color: 'status-info' },
            { type: 'action', label: 'Call Workflow', icon: Layers, color: 'status-info' },
            { type: 'action', label: 'Send Notification', icon: Bell, color: 'status-info' },
            { type: 'action', label: 'Delay', icon: Clock, color: 'status-info' },
            { type: 'action', label: 'Transform Data', icon: Wand2, color: 'status-info' },
            { type: 'action', label: 'Set Variable', icon: Code, color: 'status-info' },
            { type: 'action', label: 'Query Rows', icon: Search, color: 'status-info' },
        ];
        const aiTextNodes = [
            { type: 'action', label: 'LLM', icon: Brain, color: 'ai-accent' },
            { type: 'action', label: 'RAG', icon: Database, color: 'ai-accent' },
            { type: 'action', label: 'AI Search', icon: FileSearch, color: 'ai-accent' },
            { type: 'action', label: 'Chatbot', icon: MessageCircle, color: 'ai-accent' },
            { type: 'action', label: 'Web Scraper', icon: Globe, color: 'ai-accent' },
            { type: 'action', label: 'Email Scanner', icon: MailSearch, color: 'ai-accent' },
            { type: 'action', label: 'Recommender', icon: Star, color: 'ai-accent' },
            { type: 'action', label: 'Ranker', icon: ListOrdered, color: 'ai-accent' },
            { type: 'action', label: 'AI Classifier', icon: Tags, color: 'ai-accent' },
            { type: 'action', label: 'Tone Analyzer', icon: Smile, color: 'ai-accent' },
        ];
        const aiSpeechNodes = [
            { type: 'action', label: 'STT (Speech to Text)', icon: Mic, color: 'ai-accent' },
            { type: 'action', label: 'TTS (Text to Speech)', icon: Volume2, color: 'ai-accent' },
            { type: 'action', label: 'Speaker Detection', icon: UserCircle, color: 'ai-accent' },
            { type: 'action', label: 'Voice Sentiment', icon: HeartPulse, color: 'ai-accent' },
        ];
        const aiVisionNodes = [
            { type: 'action', label: 'Face Recognition', icon: ScanFace, color: 'ai-accent' },
            { type: 'action', label: 'Ear Recognition', icon: Ear, color: 'ai-accent' },
        ];
        const aiLinkerNodes = [
            { type: 'action', label: 'Prompt Linker', icon: Link2, color: 'ai-accent' },
            { type: 'action', label: 'Router', icon: GitFork, color: 'ai-accent' },
            { type: 'action', label: 'Model Switcher', icon: ToggleRight, color: 'ai-accent' },
            { type: 'action', label: 'Normalizer', icon: AlignJustify, color: 'ai-accent' },
            { type: 'action', label: 'Aggregator', icon: Combine, color: 'ai-accent' },
        ];
        const errorNodes = [
            { type: 'trycatch', label: 'Try / Catch', icon: ShieldAlert, color: 'status-error' },
            { type: 'error_branch', label: 'Error Branch', icon: GitBranch, color: 'status-warning' },
            { type: 'utility', label: 'Retry Step', icon: RotateCw, color: 'status-info' },
        ];

        return {
            triggers: triggerNodes.filter(n => match(n.label)),
            logic: logicNodes.filter(n => match(n.label)),
            actions: actionNodes.filter(n => match(n.label)),
            aiText: aiTextNodes.filter(n => match(n.label)),
            aiSpeech: aiSpeechNodes.filter(n => match(n.label)),
            aiVision: aiVisionNodes.filter(n => match(n.label)),
            aiLinkers: aiLinkerNodes.filter(n => match(n.label)),
            errors: errorNodes.filter(n => match(n.label)),
            hasAI: [...aiTextNodes, ...aiSpeechNodes, ...aiVisionNodes, ...aiLinkerNodes].some(n => match(n.label)),
            hasAIModels: [...aiTextNodes, ...aiSpeechNodes, ...aiVisionNodes].some(n => match(n.label)),
        };
    }, [sidebarSearch]);

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
        setCenter(node.position.x + 110, node.position.y + 40, { zoom: 1, duration: 800 });
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

    // Initialize from template or local storage
    useEffect(() => {
        const templateId = searchParams.get('template');
        // If there's an existing id from the URL, try to load it first
        if (id && id !== 'new') {
            const localFlow = getFlowFromLocal(id);
            if (localFlow) {
                setNodes(localFlow.nodes);
                setEdges(localFlow.edges);
                setWorkflowName(localFlow.name);
                setWorkflowStatus(localFlow.status);
                return;
            }
        }

        if (templateId && mockTemplateFlows[templateId]) {
            const flow = mockTemplateFlows[templateId];
            setNodes(flow.nodes);
            setEdges(flow.edges);
        }
    }, [id, searchParams, setNodes, setEdges]);

    const handleSaveLocal = () => {
        if (!id) return;
        saveFlowToLocal({
            id: id === 'new' ? 'new_saved' : id,
            name: workflowName,
            status: workflowStatus,
            nodes,
            edges,
            updatedAt: new Date().toISOString()
        });
        // In reality, this might show a toast
    };

    const handleExport = () => {
        exportFlowToJson({
            id: id || 'export',
            name: workflowName,
            status: workflowStatus,
            nodes,
            edges,
            updatedAt: new Date().toISOString()
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                const importedFlow = JSON.parse(result) as WorkflowSaveData;

                if (importedFlow && importedFlow.nodes && importedFlow.edges) {
                    setNodes(importedFlow.nodes);
                    setEdges(importedFlow.edges);
                    if (importedFlow.name) setWorkflowName(importedFlow.name);
                    if (importedFlow.status) setWorkflowStatus(importedFlow.status);

                    // Reset selected node
                    setSelectedNode(null);
                } else {
                    alert('Invalid workflow JSON file. Missing nodes or edges.');
                }
            } catch (error) {
                alert('Failed to parse the JSON file.');
                console.error(error);
            }
        };
        reader.readAsText(file);

        // Reset input so the same file could be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onConnect = useCallback((params: Connection | Edge) => {
        takeSnapshot();
        setEdges((eds) => addEdge({ ...params, type: 'custom', animated: false }, eds));
    }, [setEdges, takeSnapshot]);

    const runTestSimulation = () => {
        setTestState('running');
        setTimeout(() => {
            setTestState('success');
        }, 2000); // simulate 2s runtime
    };

    const addInitialNode = (type: string, label: string) => {
        takeSnapshot();
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
            const configSummary: Record<string, string> = {};

            if (node.type === 'trigger') {
                if (newData.label === 'Schedule') {
                    if (newData.frequency === 'hourly') {
                        isConfigured = !!newData.minute;
                        if (newData.minute) configSummary['Minute'] = `:${newData.minute}`;
                    } else if (newData.frequency === 'daily') {
                        isConfigured = !!newData.time;
                        if (newData.time) configSummary['At'] = newData.time;
                    } else if (newData.frequency === 'weekly') {
                        isConfigured = !!(newData.time && newData.daysOfWeek && newData.daysOfWeek.length > 0);
                        if (newData.daysOfWeek) configSummary['Days'] = newData.daysOfWeek.join(',');
                    } else if (newData.frequency === 'monthly') {
                        isConfigured = !!(newData.time && newData.daysOfMonth && newData.daysOfMonth.length > 0);
                        if (newData.daysOfMonth) configSummary['Days'] = newData.daysOfMonth.join(',');
                    } else if (newData.frequency === 'cron') {
                        isConfigured = !!newData.cronExpression;
                        if (newData.cronExpression) configSummary['Cron'] = newData.cronExpression;
                    } else {
                        isConfigured = false;
                    }
                } else if (newData.label === 'Record Created' || newData.label === 'Record Deleted') {
                    isConfigured = !!newData.table;
                    if (newData.table) configSummary['Table'] = newData.table;
                    if (newData.filterField && newData.filterValue) configSummary['Filter'] = `${newData.filterField} ${(newData.filterOperator || '=')} ${newData.filterValue}`;
                } else if (newData.label === 'Form Submitted') {
                    isConfigured = !!newData.formId;
                    if (newData.formId) configSummary['Form'] = newData.formId;
                    if (newData.conditionField && newData.conditionValue) configSummary['Condition'] = `${newData.conditionField} ${(newData.conditionOperator || '=')} ${newData.conditionValue}`;
                } else if (newData.label === 'Field Updated') {
                    isConfigured = !!(newData.table && newData.column);
                    if (newData.table) configSummary['Table'] = newData.table;
                    if (newData.column) configSummary['Field'] = newData.column;
                    if (newData.conditionField && newData.conditionValue) configSummary['Condition'] = `${newData.conditionField} ${(newData.conditionOperator || '=')} ${newData.conditionValue}`;
                } else {
                    isConfigured = true;
                }
            } else if (node.type === 'action' && newData.label === 'Send Email') {
                isConfigured = !!(newData.recipient && newData.subject);
                if (newData.recipient) configSummary['To'] = newData.recipient;
                if (newData.subject) configSummary['Subject'] = newData.subject;
            } else if (node.type === 'action' && newData.label === 'Create Task') {
                isConfigured = !!newData.taskTitle;
                if (newData.taskTitle) configSummary['Task'] = newData.taskTitle;
            } else if (node.type === 'action' && newData.label === 'Transform Data') {
                isConfigured = !!(newData.transformType && newData.transformAction);
                if (newData.transformType) configSummary['Type'] = newData.transformType;
                if (newData.transformAction) configSummary['Action'] = newData.transformAction;
            } else if (node.type === 'action' && newData.label === 'Set Variable') {
                isConfigured = !!(newData.varName && newData.varValue);
                if (newData.varName) configSummary['Var'] = newData.varName;
            } else if (node.type === 'action' && newData.label === 'Query Rows') {
                isConfigured = !!newData.tableName;
                if (newData.tableName) configSummary['Table'] = newData.tableName;
            } else if (node.type === 'action' && newData.label === 'Call Workflow') {
                isConfigured = !!newData.workflowId;
                if (newData.workflowId) configSummary['Flow'] = mockWorkflows.find(w => w.id === newData.workflowId)?.name || mockTemplates.find(w => w.id === newData.workflowId)?.name || 'Selected';
            } else if (node.type === 'condition') {
                const isValReq = newData.operator !== 'is_empty' && newData.operator !== 'not_empty';
                isConfigured = !!(newData.field && newData.operator && (!isValReq || newData.value));
                if (newData.field) configSummary['If'] = newData.field;
                if (newData.operator) configSummary['Is'] = newData.operator;
                if (newData.value && isValReq) configSummary['Value'] = newData.value;
            } else if (node.type === 'loop') {
                isConfigured = !!newData.listVariable;
                if (newData.listVariable) configSummary['List'] = newData.listVariable;
            } else if (node.type === 'parallel') {
                isConfigured = true;
                if (newData.branches) configSummary['Branches'] = newData.branches.length.toString();
            } else if (node.type === 'trycatch') {
                isConfigured = true;
                if (newData.errorVariable) configSummary['Var'] = newData.errorVariable;
            } else if (node.type === 'error_branch') {
                if (newData.detectionMode === 'custom') {
                    isConfigured = !!(newData.field && newData.operator && newData.value);
                    if (newData.field) configSummary['If'] = newData.field;
                } else {
                    isConfigured = true;
                    configSummary['Mode'] = 'Automatic';
                }
            } else if (node.type === 'utility') {
                if (newData.label === 'Retry Step') {
                    isConfigured = !!newData.attempts;
                    if (newData.attempts) configSummary['Retries'] = newData.attempts;
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

    const onNodesDelete = useCallback((deletedNodes: Node[]) => {
        takeSnapshot();
        if (selectedNode && deletedNodes.some(n => n.id === selectedNode.id)) {
            setSelectedNode(null);
        }
    }, [selectedNode, takeSnapshot]);

    const onEdgesDelete = useCallback((_deletedEdges: Edge[]) => {
        takeSnapshot();
    }, [takeSnapshot]);

    const handleDeleteNode = useCallback((nodeId: string) => {
        takeSnapshot();
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNode(null);
    }, [setNodes, setEdges, takeSnapshot]);

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

            takeSnapshot();
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
        [setNodes, takeSnapshot]
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
                            <input
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                className="font-bold text-text-primary bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-primary transition-colors focus:bg-background-canvas rounded px-1"
                            />
                            <Badge variant={workflowStatus === 'Draft' ? 'default' : 'success'}>{workflowStatus}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 lg:gap-4">
                    <Button variant="ghost" size="sm" onClick={handleImportClick} title="Import Flow JSON" className="hidden sm:flex px-2">
                        <Upload className="w-4 h-4" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                    <Button variant="ghost" size="sm" onClick={handleExport} title="Export Flow JSON" className="hidden sm:flex px-2">
                        <Download className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border hidden sm:block mx-1"></div>

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
                    <Button variant="outline" size="sm" onClick={() => { setWorkflowStatus('Draft'); handleSaveLocal(); }}>
                        Save Draft
                    </Button>
                    <Button
                        size="sm"
                        disabled={invalidNodes.length > 0 || nodes.length === 0}
                        onClick={() => { setWorkflowStatus('Active'); handleSaveLocal(); }}
                    >
                        Publish
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Node Library */}
                <aside className="w-64 bg-white border-r border-border/60 flex flex-col shrink-0 z-10">
                    <div className="p-3 border-b border-border/60">
                        <div className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Blocks Library</div>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search blocks..."
                                value={sidebarSearch}
                                onChange={(e) => setSidebarSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background-canvas border border-border/60 rounded-lg focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-text-muted/60 transition-colors"
                            />
                            {sidebarSearch && (
                                <button onClick={() => setSidebarSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {/* ── Render a sidebar node block ── */}
                        {(() => {
                            const renderNode = (node: { type: string; label: string; icon: any; color: string }, isAI = false) => {
                                 const NodeIcon = node.icon;
                                const q = sidebarSearch.toLowerCase().trim();
                                const labelParts = q ? node.label.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')) : [node.label];

                                // Explicit color mapping to ensure Tailwind v4 pick-up
                                const colorMap: Record<string, string> = {
                                    'status-success': 'text-status-success bg-status-success/10',
                                    'status-warning': 'text-status-warning bg-status-warning/10',
                                    'status-info': 'text-status-info bg-status-info/10',
                                    'status-error': 'text-status-error bg-status-error/10',
                                    'ai-accent': 'text-ai-accent bg-ai-accent/15',
                                };

                                const colorClasses = colorMap[node.color] || 'text-text-muted bg-border/20';

                                return (
                                    <div
                                        key={node.label}
                                        className={`p-2 bg-white border border-border/60 rounded-lg cursor-grab hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all flex items-center gap-2.5 ${isAI ? 'bg-gradient-to-r from-[rgba(124,58,237,0.04)] to-white border-l-2 border-l-ai-accent/60' : 'border-l-2 border-l-' + (node.color.split('-')[1] || 'gray-400')}`}
                                        onDragStart={(e) => onDragStart(e, node.type, node.label === 'For Each Loop' ? 'For Each' : node.label)}
                                        draggable
                                    >
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${colorClasses.split(' ')[1]}`}>
                                            <NodeIcon className={`w-4 h-4 ${colorClasses.split(' ')[0]}`} />
                                        </div>
                                        <span className="text-[13px] font-medium text-text-primary pr-1 truncate flex-1">
                                            {q ? labelParts.map((part, i) =>
                                                part.toLowerCase() === q ? <mark key={i} className="search-highlight">{part}</mark> : part
                                            ) : node.label}
                                        </span>
                                        {isAI && <Sparkles className="w-3 h-3 text-ai-accent/50 shrink-0 ml-auto" />}
                                    </div>
                                );
                            };

                            const isSearching = !!sidebarSearch.trim();

                            return (
                                <>
                                    {/* ── Triggers ── */}
                                    {filteredGroups.triggers.length > 0 && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-primary transition-colors">
                                                Triggers
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-1 mb-3 pl-0.5">
                                                {filteredGroups.triggers.map(n => renderNode(n))}
                                            </div>
                                        </details>
                                    )}

                                    {/* ── Logic ── */}
                                    {filteredGroups.logic.length > 0 && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-primary transition-colors">
                                                Logic
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-1 mb-3 pl-0.5">
                                                {filteredGroups.logic.map(n => renderNode(n))}
                                            </div>
                                        </details>
                                    )}

                                    {/* ── Actions ── */}
                                    {filteredGroups.actions.length > 0 && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-primary transition-colors">
                                                Actions
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-1 mb-3 pl-0.5">
                                                {filteredGroups.actions.map(n => renderNode(n))}
                                            </div>
                                        </details>
                                    )}

                                    {/* ── AI Extensions ── */}
                                    {filteredGroups.hasAI && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-ai-accent transition-colors">
                                                <span className="flex items-center gap-1">AI Extensions <Sparkles className="w-3 h-3 text-ai-accent/50" /></span>
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-1 mb-3 pl-1">
                                                {/* AI Models */}
                                                {filteredGroups.hasAIModels && (
                                                    <details className="sidebar-group" open>
                                                        <summary className="text-[10px] font-semibold text-text-muted mb-1 cursor-pointer list-none flex items-center gap-1 py-1 select-none uppercase tracking-wider hover:text-ai-accent transition-colors">
                                                            <ChevronRight className="w-3 h-3 chevron-icon" />
                                                            AI Models
                                                        </summary>
                                                        <div className="pl-2 space-y-0.5">
                                                            {/* Text */}
                                                            {filteredGroups.aiText.length > 0 && (
                                                                <details className="sidebar-group" open>
                                                                    <summary className="text-[10px] font-medium text-text-muted/80 mb-1 cursor-pointer list-none flex items-center gap-1 py-0.5 select-none">
                                                                        <ChevronRight className="w-2.5 h-2.5 chevron-icon" />
                                                                        Text
                                                                    </summary>
                                                                    <div className="space-y-1 pl-1 mb-2">
                                                                        {filteredGroups.aiText.map(n => renderNode(n, true))}
                                                                    </div>
                                                                </details>
                                                            )}
                                                            {/* Speech */}
                                                            {filteredGroups.aiSpeech.length > 0 && (
                                                                <details className="sidebar-group" open>
                                                                    <summary className="text-[10px] font-medium text-text-muted/80 mb-1 cursor-pointer list-none flex items-center gap-1 py-0.5 select-none">
                                                                        <ChevronRight className="w-2.5 h-2.5 chevron-icon" />
                                                                        Speech
                                                                    </summary>
                                                                    <div className="space-y-1 pl-1 mb-2">
                                                                        {filteredGroups.aiSpeech.map(n => renderNode(n, true))}
                                                                    </div>
                                                                </details>
                                                            )}
                                                            {/* Vision */}
                                                            {filteredGroups.aiVision.length > 0 && (
                                                                <details className="sidebar-group" open>
                                                                    <summary className="text-[10px] font-medium text-text-muted/80 mb-1 cursor-pointer list-none flex items-center gap-1 py-0.5 select-none">
                                                                        <ChevronRight className="w-2.5 h-2.5 chevron-icon" />
                                                                        Vision
                                                                    </summary>
                                                                    <div className="space-y-1 pl-1 mb-2">
                                                                        {filteredGroups.aiVision.map(n => renderNode(n, true))}
                                                                    </div>
                                                                </details>
                                                            )}
                                                        </div>
                                                    </details>
                                                )}
                                                {/* AI Linkers */}
                                                {filteredGroups.aiLinkers.length > 0 && (
                                                    <details className="sidebar-group" open>
                                                        <summary className="text-[10px] font-semibold text-text-muted mb-1 cursor-pointer list-none flex items-center gap-1 py-1 select-none uppercase tracking-wider hover:text-ai-accent transition-colors">
                                                            <ChevronRight className="w-3 h-3 chevron-icon" />
                                                            AI Linkers
                                                        </summary>
                                                        <div className="space-y-1 pl-3 mb-2">
                                                            {filteredGroups.aiLinkers.map(n => renderNode(n, true))}
                                                        </div>
                                                    </details>
                                                )}
                                            </div>
                                        </details>
                                    )}

                                    {/* ── Error & Utility ── */}
                                    {filteredGroups.errors.length > 0 && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-primary transition-colors">
                                                Error & Utility
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-1 mb-3 pl-0.5">
                                                {filteredGroups.errors.map(n => renderNode(n))}
                                            </div>
                                        </details>
                                    )}

                                    {/* ── Connected Tools Library ── */}
                                    {!isSearching && (
                                        <details className="sidebar-group" open>
                                            <summary className="text-[11px] font-semibold text-text-primary mb-1.5 cursor-pointer list-none flex items-center justify-between py-1.5 select-none hover:text-primary transition-colors">
                                                Tools
                                                <ChevronRight className="w-3.5 h-3.5 text-text-muted chevron-icon" />
                                            </summary>
                                            <div className="space-y-3 mb-3">
                                                {IN_MEMORY_INTEGRATIONS.map(tool => {
                                                    const ToolIcon = tool.icon;
                                                    if (tool.status !== 'connected') return null;
                                                    return (
                                                        <div key={tool.id} className="space-y-1.5">
                                                            <div className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                                                                <ToolIcon className="w-3 h-3" />
                                                                {tool.name}
                                                            </div>
                                                            {tool.triggers && tool.triggers.length > 0 && (
                                                                <div className="mb-1.5">
                                                                    <span className="text-[9px] text-text-muted font-medium mb-0.5 inline-block uppercase tracking-wide">Triggers</span>
                                                                    {tool.triggers.map(trigger => (
                                                                        <div
                                                                            key={trigger.id}
                                                                            className="p-2 bg-white border border-border/60 rounded-lg cursor-grab hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all flex items-center gap-2 mb-1"
                                                                            style={{ borderLeftWidth: 2, borderLeftColor: tool.color }}
                                                                            onDragStart={(e) => onDragStart(e, 'tool_trigger', trigger.name, { triggerId: trigger.id })} draggable
                                                                        >
                                                                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: tool.color }}>
                                                                                <ToolIcon className="w-3 h-3" />
                                                                            </div>
                                                                            <span className="text-[13px] font-medium text-text-primary pr-1">{trigger.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {tool.actions && tool.actions.length > 0 && (
                                                                <div>
                                                                    <span className="text-[9px] text-text-muted font-medium mb-0.5 inline-block uppercase tracking-wide">Actions</span>
                                                                    {tool.actions.map(action => (
                                                                        <div
                                                                            key={action.id}
                                                                            className="p-2 bg-white border border-border/60 rounded-lg cursor-grab hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all flex items-center gap-2.5 mb-1"
                                                                            style={{ borderLeftWidth: 2, borderLeftColor: tool.color }}
                                                                            onDragStart={(e) => onDragStart(e, 'tool', action.name, { actionId: action.id })} draggable
                                                                        >
                                                                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: tool.color }}>
                                                                                <ToolIcon className="w-3.5 h-3.5" />
                                                                            </div>
                                                                            <span className="text-[13px] font-medium text-text-primary pr-1">{action.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {IN_MEMORY_INTEGRATIONS.every(t => t.status !== 'connected') && (
                                                    <div className="text-xs text-text-secondary italic text-center py-4 bg-background-canvas rounded-lg border border-border/60">
                                                        No tools connected. Go to Integrations to connect apps.
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    )}

                                    {/* Empty search state */}
                                    {isSearching && filteredGroups.triggers.length === 0 && filteredGroups.logic.length === 0 && filteredGroups.actions.length === 0 && !filteredGroups.hasAI && filteredGroups.errors.length === 0 && (
                                        <div className="text-xs text-text-muted text-center py-8">
                                            No blocks match "{sidebarSearch}"
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </aside>


                {/* Center Canvas */}
                <main className="flex-1 h-full w-full relative bg-background-canvas" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes.map(node => ({ ...node, draggable: !isLocked, selectable: true }))}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={(changes) => !isLocked && onNodesChange(changes)}
                        onEdgesChange={(changes) => !isLocked && onEdgesChange(changes)}
                        onConnect={(params) => !isLocked && onConnect(params)}
                        onNodesDelete={(nodes) => !isLocked && onNodesDelete(nodes)}
                        onEdgesDelete={(edges) => !isLocked && onEdgesDelete(edges)}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        onNodeDragStart={!isLocked ? onNodeDragStart : undefined}
                        onDrop={onDrop} // Allow adding nodes while locked as per feedback
                        onDragOver={onDragOver}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={{ type: 'custom', animated: false }}
                        connectionLineType={'custom' as any}
                        fitView
                        className="bg-background-canvas"
                        nodesDraggable={!isLocked}
                        nodesConnectable={!isLocked}
                        panOnDrag={!isLocked && !isSelectMode}
                        selectionOnDrag={!isLocked && isSelectMode}
                        selectionMode={isSelectMode ? 'partial' as any : undefined}
                        elementsSelectable={true} 
                        deleteKeyCode={isLocked ? null : 'Delete'}
                        multiSelectionKeyCode={isLocked ? null : 'Shift'}
                        preventScrolling={isLocked}
                    >
                        {showGrid && <Background gap={24} size={1.5} color="#cbd5e1" variant={BackgroundVariant.Dots} />}
                        
                        {/* Unified Canvas Settings Toolbar */}
                        <div className="absolute bottom-6 left-6 z-[20] flex items-center bg-white/95 backdrop-blur-lg border border-border/80 shadow-2xl rounded-2xl p-1.5 gap-1.5 ring-1 ring-black/5">
                            {/* History Group */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-text-secondary hover:bg-black/5 hover:text-text-primary rounded-xl transition-all disabled:opacity-50"
                                    onClick={undo}
                                    disabled={past.length === 0 || isLocked}
                                    title="Undo"
                                >
                                    <Undo2 className="w-4.5 h-4.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-text-secondary hover:bg-black/5 hover:text-text-primary rounded-xl transition-all disabled:opacity-50"
                                    onClick={redo}
                                    disabled={future.length === 0 || isLocked}
                                    title="Redo"
                                >
                                    <Redo2 className="w-4.5 h-4.5" />
                                </Button>
                            </div>

                            <div className="w-px h-4 bg-border/60 mx-1" />

                            {/* Mode Group */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 w-9 p-0 rounded-xl transition-all ${!isSelectMode ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-text-tertiary hover:bg-black/5'}`}
                                    onClick={() => !isLocked && setIsSelectMode(false)}
                                    title="Pan Mode"
                                    disabled={isLocked}
                                >
                                    <Move className="w-4.5 h-4.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 w-9 p-0 rounded-xl transition-all ${isSelectMode ? 'text-primary bg-primary/10 hover:bg-primary/20' : 'text-text-tertiary hover:bg-black/5'}`}
                                    onClick={() => !isLocked && setIsSelectMode(true)}
                                    title="Select Mode"
                                    disabled={isLocked}
                                >
                                    <MousePointer2 className="w-4.5 h-4.5" />
                                </Button>
                            </div>

                            <div className="w-px h-4 bg-border/60 mx-1" />

                            {/* Zoom Group */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-text-secondary hover:bg-black/5 hover:text-text-primary rounded-xl transition-all"
                                    onClick={() => zoomOut()}
                                    title="Minimize (Zoom Out)"
                                >
                                    <Minus className="w-4.5 h-4.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 text-text-secondary hover:bg-black/5 hover:text-text-primary rounded-xl transition-all"
                                    onClick={() => zoomIn()}
                                    title="Maximize (Zoom In)"
                                >
                                    <Plus className="w-4.5 h-4.5" />
                                </Button>
                            </div>

                            <div className="w-px h-4 bg-border/60 mx-1" />

                            {/* View Group */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-text-secondary hover:bg-black/5 hover:text-text-primary rounded-xl transition-all"
                                onClick={() => fitView()}
                                title="Focus (Fit View)"
                            >
                                <Maximize className="w-4.5 h-4.5" />
                            </Button>

                            <div className="w-px h-4 bg-border/60 mx-1" />

                            {/* Settings Group */}
                            <div className="flex items-center gap-0.5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 w-9 p-0 rounded-xl transition-all ${!showGrid ? 'text-text-tertiary hover:bg-black/5' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}
                                    onClick={() => setShowGrid(!showGrid)}
                                    title={showGrid ? "Hide Grid" : "Show Grid"}
                                >
                                    <Grid className="w-4.5 h-4.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-9 w-9 p-0 rounded-xl transition-all ${isLocked ? 'text-status-error bg-status-error/10 hover:bg-status-error/20' : 'text-text-tertiary hover:bg-black/5'}`}
                                    onClick={() => setIsLocked(!isLocked)}
                                    title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                                >
                                    {isLocked ? <Lock className="w-4.5 h-4.5" /> : <Unlock className="w-4.5 h-4.5" />}
                                </Button>
                            </div>
                        </div>

                        {nodes.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                <div className="bg-white p-8 rounded-card shadow-lg border border-border flex flex-col items-center text-center max-w-sm pointer-events-auto">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Zap className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold text-text-primary mb-2">Start with a Trigger</h2>
                                    <p className="text-text-secondary text-sm mb-6">Choose an event that will start your workflow. You can drag a block from the library or choose one below.</p>
                                    <div className="w-full space-y-2">
                                        <button className="w-full flex items-center gap-3 p-3 border border-border rounded-btn hover:border-primary hover:bg-primary/5 transition-colors text-left" onClick={() => addInitialNode('trigger', 'Manual Trigger')}>
                                            <div className="w-8 h-8 rounded bg-status-success/10 flex flex-shrink-0 items-center justify-center text-status-success"><Play className="w-4 h-4" /></div>
                                            <span className="font-medium text-sm text-text-primary">Manual Trigger</span>
                                        </button>
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
                {selectedNode && (
                    <aside className="w-80 bg-white border-l border-border flex flex-col shrink-0 z-10 shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                        <div className="flex border-b border-border">
                            <button
                                className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${activeConfigTab === 'config' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                                onClick={() => setActiveConfigTab('config')}
                            >
                                Configuration
                            </button>
                            <button
                                className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${activeConfigTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                                onClick={() => setActiveConfigTab('preview')}
                            >
                                Preview
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {!selectedNode ? (
                                <div className="flex flex-col items-center justify-center text-center p-6 h-full">
                                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-3">
                                        <span className="text-text-secondary text-xl">👆</span>
                                    </div>
                                    <p className="text-text-secondary text-sm">Select a block on the canvas to configure its properties.</p>
                                </div>
                            ) : activeConfigTab === 'preview' ? (
                                <div className="p-6 h-full flex flex-col">
                                    <h3 className="font-bold text-lg text-text-primary mb-1">Step Output</h3>
                                    <p className="text-text-secondary text-sm mb-4">Sample data returned by this step.</p>
                                    <div className="bg-background-canvas border border-border rounded-btn p-4 font-mono text-xs text-text-secondary whitespace-pre overflow-x-auto flex-1 h-0">
                                        {`{
  "id": "step_${selectedNode.id}",
  "type": "${selectedNode.type}",
  "status": "success",
  "data": {
    "recordsProcessed": 1,
    "timestamp": "${new Date().toISOString()}"
  }
}`}
                                    </div>
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
                                            <label className="text-sm font-medium text-text-primary">Internal Notes</label>
                                            <textarea
                                                className="w-full bg-transparent border border-border rounded-btn p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y placeholder:text-text-tertiary"
                                                placeholder="Add context or notes for your team..."
                                                value={selectedNode.data.description as string || ''}
                                                onChange={(e) => updateSelectedNodeData({ description: e.target.value })}
                                            />
                                        </div>

                                        {/* Trigger Node Fields */}
                                        {selectedNode.type === 'trigger' && selectedNode.data.label === 'Manual Trigger' && (
                                            <>
                                                <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Button Text</label>
                                                        <Input
                                                            value={selectedNode.data.buttonText as string || 'Run Workflow'}
                                                            onChange={e => updateSelectedNodeData({ buttonText: e.target.value })}
                                                            placeholder="e.g., Start Onboarding"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Trigger Permissions</label>
                                                        <select
                                                            className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                            value={selectedNode.data.permissions as string || 'everyone'}
                                                            onChange={e => updateSelectedNodeData({ permissions: e.target.value })}
                                                        >
                                                            <option value="everyone">Everyone</option>
                                                            <option value="admins">Workspace Admins Only</option>
                                                            <option value="specific_roles">Specific Roles</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div className="space-y-0.5">
                                                            <label className="text-sm font-medium text-text-primary">Confirmation Required</label>
                                                            <p className="text-xs text-text-secondary">Show a dialog before execution.</p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" checked={!!selectedNode.data.confirmationRequired} onChange={e => updateSelectedNodeData({ confirmationRequired: e.target.checked })} />
                                                            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>

                                                    <div className="space-y-3 pt-4 border-t border-border">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-sm font-medium text-text-primary">Required Inputs</label>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => {
                                                                    const currentInputs = (selectedNode.data.requiredInputs as any[]) || [];
                                                                    updateSelectedNodeData({
                                                                        requiredInputs: [...currentInputs, { id: Date.now().toString(), name: '', type: 'text', required: true }]
                                                                    });
                                                                }}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" /> Add Input
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-text-secondary">Data the user must provide when triggering this workflow.</p>

                                                        {((selectedNode.data.requiredInputs as any[]) || []).length === 0 ? (
                                                            <div className="text-center p-3 border border-dashed border-border rounded-btn bg-background/50">
                                                                <span className="text-xs text-text-secondary">No inputs required.</span>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {((selectedNode.data.requiredInputs as any[]) || []).map((input: any, index: number) => (
                                                                    <div key={input.id} className="p-3 border border-border rounded-btn bg-background-canvas space-y-3 relative group">
                                                                        <button
                                                                            type="button"
                                                                            className="absolute top-2 right-2 text-text-tertiary hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            onClick={() => {
                                                                                const inputs = [...(selectedNode.data.requiredInputs as any[])];
                                                                                inputs.splice(index, 1);
                                                                                updateSelectedNodeData({ requiredInputs: inputs });
                                                                            }}
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>

                                                                        <div className="pr-6 space-y-3">
                                                                            <div className="space-y-1.5">
                                                                                <label className="text-xs font-medium text-text-secondary">Input Name</label>
                                                                                <Input
                                                                                    value={input.name}
                                                                                    placeholder="e.g., Customer Email"
                                                                                    className="h-8 text-xs"
                                                                                    onChange={(e) => {
                                                                                        const inputs = [...(selectedNode.data.requiredInputs as any[])];
                                                                                        inputs[index] = { ...inputs[index], name: e.target.value };
                                                                                        updateSelectedNodeData({ requiredInputs: inputs });
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex gap-3">
                                                                                <div className="flex-1 space-y-1.5">
                                                                                    <label className="text-xs font-medium text-text-secondary">Type</label>
                                                                                    <select
                                                                                        className="flex h-8 w-full rounded-btn border border-border bg-transparent px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                                                        value={input.type}
                                                                                        onChange={(e) => {
                                                                                            const inputs = [...(selectedNode.data.requiredInputs as any[])];
                                                                                            inputs[index] = { ...inputs[index], type: e.target.value };
                                                                                            updateSelectedNodeData({ requiredInputs: inputs });
                                                                                        }}
                                                                                    >
                                                                                        <option value="text">Text</option>
                                                                                        <option value="number">Number</option>
                                                                                        <option value="boolean">Yes/No</option>
                                                                                        <option value="date">Date</option>
                                                                                    </select>
                                                                                </div>
                                                                                <div className="flex items-end pb-1.5">
                                                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={input.required !== false}
                                                                                            onChange={(e) => {
                                                                                                const inputs = [...(selectedNode.data.requiredInputs as any[])];
                                                                                                inputs[index] = { ...inputs[index], required: e.target.checked };
                                                                                                updateSelectedNodeData({ requiredInputs: inputs });
                                                                                            }}
                                                                                            className="rounded border-border text-primary focus:ring-primary/20"
                                                                                        />
                                                                                        <span className="text-xs text-text-secondary">Required</span>
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* End of Trigger Configuration */}\n
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
                                                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">Trigger When (Condition) <span className="text-text-tertiary">Optional</span></label>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="Field (e.g. Email)" value={selectedNode.data.conditionField as string || ''} onChange={e => updateSelectedNodeData({ conditionField: e.target.value })} className="flex-1" />
                                                        <select className="flex h-10 w-24 rounded-btn border border-border bg-transparent px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" value={selectedNode.data.conditionOperator as string || '='} onChange={e => updateSelectedNodeData({ conditionOperator: e.target.value })}>
                                                            <option value="=">Equals</option><option value="!=">Not Eq</option><option value=">">Greater</option><option value="<">Less</option>
                                                        </select>
                                                        <Input placeholder="Value" value={selectedNode.data.conditionValue as string || ''} onChange={e => updateSelectedNodeData({ conditionValue: e.target.value })} className="flex-1" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-0.5">
                                                        <label className="text-sm font-medium text-text-primary">Include File Uploads</label>
                                                        <p className="text-xs text-text-secondary">Download files as part of payload.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={selectedNode.data.includeFiles !== false} onChange={e => updateSelectedNodeData({ includeFiles: e.target.checked })} />
                                                        <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'trigger' && selectedNode.data.label === 'Record Created' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
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
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">Filter Conditions <span className="text-text-tertiary">Optional</span></label>
                                                    <div className="flex gap-2">
                                                        <Input placeholder="Field (e.g. Status)" value={selectedNode.data.filterField as string || ''} onChange={e => updateSelectedNodeData({ filterField: e.target.value })} className="flex-1" />
                                                        <select className="flex h-10 w-24 rounded-btn border border-border bg-transparent px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" value={selectedNode.data.filterOperator as string || '='} onChange={e => updateSelectedNodeData({ filterOperator: e.target.value })}>
                                                            <option value="=">Equals</option><option value="!=">Not Eq</option><option value=">">Greater</option><option value="<">Less</option>
                                                        </select>
                                                        <Input placeholder="Value (e.g. New)" value={selectedNode.data.filterValue as string || ''} onChange={e => updateSelectedNodeData({ filterValue: e.target.value })} className="flex-1" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <label className="text-sm font-medium text-text-primary">Trigger Only Once</label>
                                                        <p className="text-xs text-text-secondary">Prevents duplicates for the same record.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={!!selectedNode.data.triggerOnce} onChange={e => updateSelectedNodeData({ triggerOnce: e.target.checked })} />
                                                        <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === 'trigger' && selectedNode.data.label === 'Record Deleted' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
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
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <label className="text-sm font-medium text-text-primary">Before-Value Snapshot</label>
                                                        <p className="text-xs text-text-secondary">Stores record values before deleted.</p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={!!selectedNode.data.snapshot} onChange={e => updateSelectedNodeData({ snapshot: e.target.checked })} />
                                                        <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === 'trigger' && selectedNode.data.label === 'Field Updated' && (
                                            <>
                                                <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Table</label>
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
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Column</label>
                                                        <Input
                                                            value={selectedNode.data.column as string || ''}
                                                            onChange={e => updateSelectedNodeData({ column: e.target.value })}
                                                            placeholder="e.g. status"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 pt-2 border-t border-border">
                                                        <label className="text-sm font-medium text-text-primary flex justify-between">Condition <span className="text-text-tertiary">Optional</span></label>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Field" value={selectedNode.data.conditionField as string || ''} onChange={e => updateSelectedNodeData({ conditionField: e.target.value })} className="flex-1" />
                                                            <select className="flex h-10 w-24 rounded-btn border border-border bg-transparent px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20" value={selectedNode.data.conditionOperator as string || '='} onChange={e => updateSelectedNodeData({ conditionOperator: e.target.value })}>
                                                                <option value="=">Equals</option><option value="!=">Not Eq</option><option value=">">Greater</option><option value="<">Less</option>
                                                            </select>
                                                            <Input placeholder="Value" value={selectedNode.data.conditionValue as string || ''} onChange={e => updateSelectedNodeData({ conditionValue: e.target.value })} className="flex-1" />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-0.5">
                                                            <label className="text-sm font-medium text-text-primary">Compare Old vs New</label>
                                                            <p className="text-xs text-text-secondary">Provides old_value and new_value.</p>
                                                        </div>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input type="checkbox" className="sr-only peer" checked={selectedNode.data.compareOldNew !== false} onChange={e => updateSelectedNodeData({ compareOldNew: e.target.checked })} />
                                                            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'trigger' && selectedNode.data.label === 'Schedule' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Frequency</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.frequency as string || 'daily'}
                                                        onChange={e => updateSelectedNodeData({ frequency: e.target.value })}
                                                    >
                                                        <option value="hourly">Hourly</option>
                                                        <option value="daily">Daily</option>
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                        <option value="cron">Advanced (Cron)</option>
                                                    </select>
                                                </div>
                                                {selectedNode.data.frequency === 'hourly' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Minute (0-59)</label>
                                                        <Input
                                                            type="number" min="0" max="59"
                                                            value={selectedNode.data.minute as string || '0'}
                                                            onChange={e => updateSelectedNodeData({ minute: e.target.value })}
                                                            placeholder="e.g. 15"
                                                        />
                                                    </div>
                                                )}
                                                {['daily', 'weekly', 'monthly'].includes(selectedNode.data.frequency as string || 'daily') && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Time of day</label>
                                                        <Input
                                                            type="time"
                                                            value={selectedNode.data.time as string || '09:00'}
                                                            onChange={e => updateSelectedNodeData({ time: e.target.value })}
                                                        />
                                                    </div>
                                                )}
                                                {selectedNode.data.frequency === 'weekly' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Days of week</label>
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                                <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                                                                    <input type="checkbox" checked={((selectedNode.data.daysOfWeek as string[]) || []).includes(day)} onChange={e => {
                                                                        const current = (selectedNode.data.daysOfWeek as string[]) || [];
                                                                        updateSelectedNodeData({ daysOfWeek: e.target.checked ? [...current, day] : current.filter(d => d !== day) });
                                                                    }} className="rounded border-border text-primary focus:ring-primary/20" />
                                                                    <span className="text-xs text-text-secondary">{day}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedNode.data.frequency === 'monthly' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Days of month (1-31)</label>
                                                        <Input
                                                            value={((selectedNode.data.daysOfMonth as string[]) || []).join(', ')}
                                                            onChange={e => {
                                                                const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                                updateSelectedNodeData({ daysOfMonth: vals });
                                                            }}
                                                            placeholder="e.g. 1, 15, 30"
                                                        />
                                                    </div>
                                                )}
                                                {selectedNode.data.frequency === 'cron' && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Cron Expression</label>
                                                        <Input
                                                            value={selectedNode.data.cronExpression as string || ''}
                                                            onChange={e => updateSelectedNodeData({ cronExpression: e.target.value })}
                                                            placeholder="e.g. 0 0 * * *"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Timezone</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.timezone as string || 'UTC'}
                                                        onChange={e => updateSelectedNodeData({ timezone: e.target.value })}
                                                    >
                                                        <option value="UTC">UTC</option>
                                                        <option value="America/New_York">Eastern Time</option>
                                                        <option value="America/Chicago">Central Time</option>
                                                        <option value="America/Los_Angeles">Pacific Time</option>
                                                        <option value="Europe/London">London</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

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
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">
                                                        Body / Context
                                                        <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ body: 'Hi {{customer.first_name}},\n\n' })}>Insert Variable</button>
                                                    </label>
                                                    <textarea
                                                        className="flex min-h-[100px] w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y"
                                                        value={selectedNode.data.body as string || ''}
                                                        onChange={e => updateSelectedNodeData({ body: e.target.value })}
                                                        placeholder="Enter your email message here..."
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Request Approval' && (
                                            <>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">
                                                        Approver
                                                        <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ approver: '{{manager.email}}' })}>Insert Variable</button>
                                                    </label>
                                                    <Input
                                                        value={selectedNode.data.approver as string || ''}
                                                        onChange={e => updateSelectedNodeData({ approver: e.target.value })}
                                                        placeholder="e.g. manager@company.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Message</label>
                                                    <textarea
                                                        className="flex min-h-[100px] w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y"
                                                        value={selectedNode.data.message as string || ''}
                                                        onChange={e => updateSelectedNodeData({ message: e.target.value })}
                                                        placeholder="Please approve this request..."
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Update Record' && (
                                            <>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                    <label className="text-sm font-medium text-text-primary">Record Type</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.recordType as string || ''}
                                                        onChange={e => updateSelectedNodeData({ recordType: e.target.value })}
                                                    >
                                                        <option value="">Select type...</option>
                                                        <option value="user">User</option>
                                                        <option value="order">Order</option>
                                                        <option value="task">Task</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Field to Update</label>
                                                    <Input
                                                        value={selectedNode.data.field as string || ''}
                                                        onChange={e => updateSelectedNodeData({ field: e.target.value })}
                                                        placeholder="e.g. status"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">
                                                        New Value
                                                        <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ value: '{{current_date}}' })}>Insert Variable</button>
                                                    </label>
                                                    <Input
                                                        value={selectedNode.data.value as string || ''}
                                                        onChange={e => updateSelectedNodeData({ value: e.target.value })}
                                                        placeholder="e.g. Completed"
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Send Notification' && (
                                            <>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                    <label className="text-sm font-medium text-text-primary flex justify-between">
                                                        Recipient
                                                        <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ recipient: '{{user.id}}' })}>Insert Variable</button>
                                                    </label>
                                                    <Input
                                                        value={selectedNode.data.recipient as string || ''}
                                                        onChange={e => updateSelectedNodeData({ recipient: e.target.value })}
                                                        placeholder="e.g. User ID or Role"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Notification Message</label>
                                                    <textarea
                                                        className="flex min-h-[60px] w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y"
                                                        value={selectedNode.data.message as string || ''}
                                                        onChange={e => updateSelectedNodeData({ message: e.target.value })}
                                                        placeholder="You have a new task assigned..."
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Delay' && (
                                            <>
                                                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <label className="text-sm font-medium text-text-primary">Duration</label>
                                                            <Input
                                                                type="number"
                                                                value={selectedNode.data.duration as string || ''}
                                                                onChange={e => updateSelectedNodeData({ duration: e.target.value })}
                                                                placeholder="e.g. 2"
                                                            />
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <label className="text-sm font-medium text-text-primary">Unit</label>
                                                            <select
                                                                className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                                value={selectedNode.data.unit as string || 'hours'}
                                                                onChange={e => updateSelectedNodeData({ unit: e.target.value })}
                                                            >
                                                                <option value="minutes">Minutes</option>
                                                                <option value="hours">Hours</option>
                                                                <option value="days">Days</option>
                                                                <option value="weeks">Weeks</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Call Workflow' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Workflow Variant</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.workflowId as string || ''}
                                                        onChange={e => updateSelectedNodeData({ workflowId: e.target.value })}
                                                    >
                                                        <option value="">Select a subflow to trigger...</option>
                                                        <optgroup label="My Workflows">
                                                            {mockWorkflows.map(w => (
                                                                <option key={w.id} value={w.id}>{w.name}</option>
                                                            ))}
                                                        </optgroup>
                                                        <optgroup label="Templates">
                                                            {mockTemplates.map(w => (
                                                                <option key={w.id} value={w.id}>{w.name}</option>
                                                            ))}
                                                        </optgroup>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Transform Data' && (
                                            <>
                                                <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Data Type</label>
                                                        <select
                                                            className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                            value={selectedNode.data.transformType as string || ''}
                                                            onChange={e => updateSelectedNodeData({ transformType: e.target.value })}
                                                        >
                                                            <option value="">Select data type...</option>
                                                            <option value="text">Text (String)</option>
                                                            <option value="number">Number</option>
                                                            <option value="date">Date & Time</option>
                                                            <option value="json">JSON / Object</option>
                                                        </select>
                                                    </div>
                                                    
                                                    {!!selectedNode.data.transformType && (
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-text-primary">Action</label>
                                                            <select
                                                                className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                                value={selectedNode.data.transformAction as string || ''}
                                                                onChange={e => updateSelectedNodeData({ transformAction: e.target.value })}
                                                            >
                                                                <option value="">Select transform action...</option>
                                                                {selectedNode.data.transformType === 'text' && (
                                                                    <>
                                                                        <option value="split">Split by character</option>
                                                                        <option value="replace">Replace text</option>
                                                                        <option value="lowercase">To Lowercase</option>
                                                                        <option value="uppercase">To Uppercase</option>
                                                                        <option value="trim">Trim whitespace</option>
                                                                    </>
                                                                )}
                                                                {selectedNode.data.transformType === 'number' && (
                                                                    <>
                                                                        <option value="format">Format Currency/Decimals</option>
                                                                        <option value="math">Math Operation (+-*/)</option>
                                                                    </>
                                                                )}
                                                                {selectedNode.data.transformType === 'date' && (
                                                                    <>
                                                                        <option value="format">Change Format</option>
                                                                        <option value="add">Add/Subtract Time</option>
                                                                    </>
                                                                )}
                                                                {selectedNode.data.transformType === 'json' && (
                                                                    <>
                                                                        <option value="extract">Extract Property</option>
                                                                        <option value="merge">Merge Objects</option>
                                                                    </>
                                                                )}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary flex justify-between">
                                                            Input Value
                                                            <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ transformInput: '{{step_1.output}}' })}>Insert Variable</button>
                                                        </label>
                                                        <Input
                                                            value={selectedNode.data.transformInput as string || ''}
                                                            onChange={e => updateSelectedNodeData({ transformInput: e.target.value })}
                                                            placeholder="Data to transform"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Set Variable' && (
                                            <>
                                                <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Variable Name</label>
                                                        <Input
                                                            value={selectedNode.data.varName as string || ''}
                                                            onChange={e => updateSelectedNodeData({ varName: e.target.value })}
                                                            placeholder="e.g. customer_status"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary flex justify-between">
                                                            Value
                                                            <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ varValue: '{{trigger.data}}' })}>Insert</button>
                                                        </label>
                                                        <Input
                                                            value={selectedNode.data.varValue as string || ''}
                                                            onChange={e => updateSelectedNodeData({ varValue: e.target.value })}
                                                            placeholder="Value to assign"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {selectedNode.type === 'action' && selectedNode.data.label === 'Query Rows' && (
                                            <>
                                                <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Table Name</label>
                                                        <Input
                                                            value={selectedNode.data.tableName as string || ''}
                                                            onChange={e => updateSelectedNodeData({ tableName: e.target.value })}
                                                            placeholder="e.g. users"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary flex justify-between">
                                                            Conditions (JSON/SQL)
                                                            <button className="text-xs text-primary hover:underline" onClick={() => updateSelectedNodeData({ queryConditions: '{"status": "active"}' })}>Example</button>
                                                        </label>
                                                        <textarea
                                                            className="flex min-h-[60px] w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y"
                                                            value={selectedNode.data.queryConditions as string || ''}
                                                            onChange={e => updateSelectedNodeData({ queryConditions: e.target.value })}
                                                            placeholder='e.g. {"status": "active"}'
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Limit</label>
                                                        <Input
                                                            type="number"
                                                            value={selectedNode.data.queryLimit as string || ''}
                                                            onChange={e => updateSelectedNodeData({ queryLimit: e.target.value })}
                                                            placeholder="10"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {/* Condition Node Fields */}
                                        {selectedNode.type === 'condition' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-medium text-text-primary">Condition Group</label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => {
                                                            const currentBranches = (selectedNode.data.branches as any[]) || [
                                                                { id: 'yes', label: 'Yes', color: 'success' },
                                                                { id: 'no', label: 'No', color: 'warning' }
                                                            ];
                                                            const newId = `branch${Date.now()}`;
                                                            const newBranches = [...currentBranches];
                                                            newBranches.splice(newBranches.length - 1, 0, { id: newId, label: 'Else If', color: 'success' });
                                                            updateSelectedNodeData({ branches: newBranches });
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> Add Rule
                                                    </Button>
                                                </div>
                                                
                                                {((selectedNode.data.branches as any[]) || [
                                                    { id: 'yes', label: 'Yes', color: 'success' },
                                                    { id: 'no', label: 'No', color: 'warning' }
                                                ]).map((branch: any, index: number, arr: any[]) => (
                                                    <div key={branch.id} className="p-3 border border-border rounded-btn bg-background-canvas space-y-3 relative group">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <Input 
                                                                value={branch.label} 
                                                                className="h-7 text-xs w-32 font-bold bg-white"
                                                                onChange={(e) => {
                                                                    const newBranches = [...arr];
                                                                    newBranches[index] = { ...branch, label: e.target.value };
                                                                    updateSelectedNodeData({ branches: newBranches });
                                                                }}
                                                            />
                                                            {index > 0 && index < arr.length - 1 && (
                                                                <button
                                                                    className="text-text-tertiary hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => {
                                                                        const newBranches = [...arr];
                                                                        newBranches.splice(index, 1);
                                                                        updateSelectedNodeData({ branches: newBranches });
                                                                    }}
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {index < arr.length - 1 ? (
                                                            <div className="space-y-2">
                                                                <Input
                                                                    placeholder="Field e.g. record.status"
                                                                    value={branch.field || ''}
                                                                    onChange={e => {
                                                                        const newBranches = [...arr];
                                                                        newBranches[index] = { ...branch, field: e.target.value };
                                                                        updateSelectedNodeData({ 
                                                                            branches: newBranches, 
                                                                            field: index === 0 ? e.target.value : selectedNode.data.field 
                                                                        });
                                                                    }}
                                                                    className="h-8 text-xs bg-white"
                                                                />
                                                                <select
                                                                    className="flex h-8 w-full rounded-btn border border-border bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
                                                                    value={branch.operator || ''}
                                                                    onChange={e => {
                                                                        const newBranches = [...arr];
                                                                        newBranches[index] = { ...branch, operator: e.target.value };
                                                                        updateSelectedNodeData({ 
                                                                            branches: newBranches, 
                                                                            operator: index === 0 ? e.target.value : selectedNode.data.operator 
                                                                        });
                                                                    }}
                                                                >
                                                                    <option value="">Select operator...</option>
                                                                    <option value="equals">equals</option>
                                                                    <option value="not_equals">not equals</option>
                                                                    <option value="contains">contains</option>
                                                                    <option value="not_contains">does not contain</option>
                                                                    <option value="is_empty">is empty</option>
                                                                    <option value="not_empty">is not empty</option>
                                                                    <option value="greater_than">greater than</option>
                                                                    <option value="less_than">less than</option>
                                                                    <option value="greater_equal">greater or equal</option>
                                                                    <option value="less_equal">less or equal</option>
                                                                    <option value="starts_with">starts with</option>
                                                                    <option value="ends_with">ends with</option>
                                                                </select>
                                                                {branch.operator !== 'is_empty' && branch.operator !== 'not_empty' && (
                                                                    <Input
                                                                        placeholder="Value"
                                                                        value={branch.value || ''}
                                                                        onChange={e => {
                                                                            const newBranches = [...arr];
                                                                            newBranches[index] = { ...branch, value: e.target.value };
                                                                            updateSelectedNodeData({ 
                                                                                branches: newBranches, 
                                                                                value: index === 0 ? e.target.value : selectedNode.data.value 
                                                                            });
                                                                        }}
                                                                        className="h-8 text-xs bg-white"
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-text-secondary italic">Fallback branch (FALSE) if no other conditions match.</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Loop Node Fields */}
                                        {selectedNode.type === 'loop' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Array Source Path</label>
                                                    <p className="text-xs text-text-secondary">Points to the list data, e.g. <span className="font-mono bg-border/50 px-1 rounded">record.items</span></p>
                                                    <Input
                                                        value={selectedNode.data.listVariable as string || ''}
                                                        onChange={e => updateSelectedNodeData({ listVariable: e.target.value })}
                                                        placeholder="Incoming array path"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="space-y-2 flex-1">
                                                        <label className="text-sm font-medium text-text-primary">Max Iterations</label>
                                                        <Input
                                                            type="number"
                                                            value={selectedNode.data.maxIterations as string || '100'}
                                                            onChange={e => updateSelectedNodeData({ maxIterations: e.target.value })}
                                                            placeholder="100"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 flex-1">
                                                        <label className="text-sm font-medium text-text-primary">Delay (ms)</label>
                                                        <Input
                                                            type="number"
                                                            value={selectedNode.data.iterationDelay as string || ''}
                                                            onChange={e => updateSelectedNodeData({ iterationDelay: e.target.value })}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Store Results Strategy</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.resultsStrategy as string || 'append'}
                                                        onChange={e => updateSelectedNodeData({ resultsStrategy: e.target.value })}
                                                    >
                                                        <option value="append">Append results to array</option>
                                                        <option value="replace">Replace input array with results</option>
                                                        <option value="none">No aggregation (fire-and-forget)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Parallel Node Fields */}
                                        {selectedNode.type === 'parallel' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-sm font-medium text-text-primary">Branches</label>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => {
                                                            const currentBranches = (selectedNode.data.branches as any[]) || [{ id: 'branch1', label: 'Branch 1' }, { id: 'branch2', label: 'Branch 2' }];
                                                            const newId = `branch${Date.now()}`;
                                                            updateSelectedNodeData({
                                                                branches: [...currentBranches, { id: newId, label: `Branch ${currentBranches.length + 1}` }]
                                                            });
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> Add
                                                    </Button>
                                                </div>
                                                
                                                {((selectedNode.data.branches as any[]) || [{ id: 'branch1', label: 'Branch 1' }, { id: 'branch2', label: 'Branch 2' }]).map((branch: any, index: number, arr: any[]) => (
                                                    <div key={branch.id} className="flex gap-2 items-center">
                                                        <Input
                                                            value={branch.label}
                                                            onChange={(e) => {
                                                                const branches = [...arr];
                                                                branches[index] = { ...branch, label: e.target.value };
                                                                updateSelectedNodeData({ branches });
                                                            }}
                                                        />
                                                        <button
                                                            className="p-2 text-text-tertiary hover:text-status-error disabled:opacity-50"
                                                            disabled={arr.length <= 2}
                                                            onClick={() => {
                                                                const branches = [...arr];
                                                                branches.splice(index, 1);
                                                                updateSelectedNodeData({ branches });
                                                            }}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedNode.type === 'trycatch' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Error Variable Name</label>
                                                    <Input
                                                        value={selectedNode.data.errorVariable as string || 'error'}
                                                        onChange={e => updateSelectedNodeData({ errorVariable: e.target.value })}
                                                        placeholder="error"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Catch Only Specific Errors</label>
                                                    <select
                                                        multiple
                                                        className="flex w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={(selectedNode.data.specificErrors as string[]) || []}
                                                        onChange={e => {
                                                            const options = Array.from(e.target.selectedOptions, option => option.value);
                                                            updateSelectedNodeData({ specificErrors: options });
                                                        }}
                                                    >
                                                        <option value="network">Network error</option>
                                                        <option value="http4xx">HTTP 4xx errors</option>
                                                        <option value="http5xx">HTTP 5xx errors</option>
                                                        <option value="timeouts">Timeouts</option>
                                                        <option value="validation">Validation errors</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {selectedNode.type === 'error_branch' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Detection Mode</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.detectionMode as string || 'automatic'}
                                                        onChange={e => updateSelectedNodeData({ detectionMode: e.target.value })}
                                                    >
                                                        <option value="automatic">Automatic (Detect standard error structure)</option>
                                                        <option value="custom">Custom Condition</option>
                                                    </select>
                                                </div>
                                                {selectedNode.data.detectionMode === 'custom' && (
                                                    <div className="p-3 border border-border rounded-btn bg-background-canvas space-y-2">
                                                        <label className="text-xs font-bold text-text-primary">Custom Error Condition</label>
                                                        <Input
                                                            placeholder="Field e.g. error.code"
                                                            value={selectedNode.data.field as string || ''}
                                                            onChange={e => updateSelectedNodeData({ field: e.target.value })}
                                                            className="h-8 text-xs bg-white"
                                                        />
                                                        <select
                                                            className="flex h-8 w-full rounded-btn border border-border bg-white px-2 py-1 text-xs"
                                                            value={selectedNode.data.operator as string || ''}
                                                            onChange={e => updateSelectedNodeData({ operator: e.target.value })}
                                                        >
                                                            <option value="">Select operator...</option>
                                                            <option value="equals">equals</option>
                                                            <option value="not_equals">not equals</option>
                                                            <option value="contains">contains</option>
                                                        </select>
                                                        <Input
                                                            placeholder="Value e.g. 401"
                                                            value={selectedNode.data.value as string || ''}
                                                            onChange={e => updateSelectedNodeData({ value: e.target.value })}
                                                            className="h-8 text-xs bg-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Utility Node Fields */}
                                        {selectedNode.type === 'utility' && selectedNode.data.label === 'Retry Step' && (
                                            <div className="space-y-4 mt-4 pt-4 border-t border-border">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Number of Retries</label>
                                                        <Input
                                                            type="number"
                                                            min="1" max="10"
                                                            value={selectedNode.data.attempts as string || '3'}
                                                            onChange={e => updateSelectedNodeData({ attempts: e.target.value })}
                                                            placeholder="3"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Retry Strategy</label>
                                                        <select
                                                            className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                            value={selectedNode.data.retryStrategy as string || 'immediate'}
                                                            onChange={e => updateSelectedNodeData({ retryStrategy: e.target.value })}
                                                        >
                                                            <option value="immediate">Immediate Retry</option>
                                                            <option value="fixed">Fixed Delay</option>
                                                            <option value="exponential">Exponential Backoff</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {(selectedNode.data.retryStrategy === 'fixed' || selectedNode.data.retryStrategy === 'exponential') && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-text-primary">Delay (ms)</label>
                                                        <Input
                                                            type="number"
                                                            value={selectedNode.data.retryDelay as string || ''}
                                                            onChange={e => updateSelectedNodeData({ retryDelay: e.target.value })}
                                                            placeholder="e.g. 2000"
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-text-primary">Fallback Behavior</label>
                                                    <select
                                                        className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        value={selectedNode.data.fallbackBehavior as string || 'throw'}
                                                        onChange={e => updateSelectedNodeData({ fallbackBehavior: e.target.value })}
                                                    >
                                                        <option value="throw">Throw error after retries</option>
                                                        <option value="default_payload">Return default payload</option>
                                                        <option value="null_output">Continue with null output</option>
                                                    </select>
                                                </div>
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

                                        <div className="pt-6 border-t border-border">
                                            <Button
                                                variant="outline"
                                                className="w-full text-status-error border-status-error/20 hover:bg-status-error/5 hover:text-status-error"
                                                onClick={() => handleDeleteNode(selectedNode.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Block
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Test Workflow">
                {testState === 'idle' ? (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-text-secondary">Run a simulation of your workflow to verify it works correctly before activating.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-text-primary text-sm">Trigger Payload (Mock)</h3>
                            <textarea
                                className="w-full bg-background-canvas border border-border rounded-btn p-4 font-mono text-xs text-text-secondary whitespace-pre overflow-x-auto min-h-[150px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={testPayload}
                                onChange={(e) => setTestPayload(e.target.value)}
                            />
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

            <AIPromptModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGeneration}
            />
        </div >
    );
}

export function Builder() {
    return (
        <ReactFlowProvider>
            <BuilderFlow />
        </ReactFlowProvider>
    );
}
