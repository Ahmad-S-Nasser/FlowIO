// Mock AI Generation Engine
import type { Node, Edge } from '@xyflow/react';

// Generates a mock UUID
const getId = () => `ai-node_${Math.random().toString(36).substring(2, 9)}`;

export interface AIGeneratedFlow {
    nodes: Node[];
    edges: Edge[];
}

export const generateFlowFromPrompt = async (prompt: string): Promise<AIGeneratedFlow> => {
    // Simulate network delay for "AI thinking"
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simple keyword-based mock engine to demonstrate the UX.
    // In a real app, this would be an API call to an LLM returning structured JSON.
    const lowerPrompt = prompt.toLowerCase();

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Determine Trigger
    let triggerNode: Node = {
        id: getId(),
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Schedule', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { Schedule: 'Every day' } }
    };

    if (lowerPrompt.includes('form') || lowerPrompt.includes('submit')) {
        triggerNode.data = { label: 'Form Submitted', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { Form: 'Contact Us' } };
    }
    nodes.push(triggerNode);

    let lastNodeId = triggerNode.id;

    // 2. Determine Condition
    let conditionNodeId: string | null = null;
    if (lowerPrompt.includes('if') || lowerPrompt.includes('budget') || lowerPrompt.includes('greater') || lowerPrompt.includes('over')) {
        const conditionNode: Node = {
            id: getId(),
            type: 'condition',
            position: { x: 0, y: 0 },
            data: {
                label: 'Condition',
                description: 'Configure this node in the right panel.',
                isConfigured: true,
                configSummary: { If: 'Budget > 1000' }
            }
        };
        nodes.push(conditionNode);

        edges.push({
            id: `e-${lastNodeId}-${conditionNode.id}`,
            source: lastNodeId,
            target: conditionNode.id,
            type: 'smoothstep',
            animated: true
        });

        lastNodeId = conditionNode.id;
        conditionNodeId = conditionNode.id;
    }

    // 3. Determine Actions (True/False or sequential)
    if (conditionNodeId) {
        // Has a condition, create Yes/No actions based on keywords

        // Yes Branch
        const sendEmailAction: Node = {
            id: getId(),
            type: 'action',
            position: { x: 0, y: 0 },
            data: { label: 'Send Email', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { To: 'sales@flowio.com', Subject: 'High value lead' } }
        };
        nodes.push(sendEmailAction);
        edges.push({
            id: `e-${conditionNodeId}-yes-${sendEmailAction.id}`,
            source: conditionNodeId,
            target: sendEmailAction.id,
            sourceHandle: 'yes',
            type: 'smoothstep',
            animated: true
        });

        // No Branch (if mentioned task or otherwise)
        if (lowerPrompt.includes('otherwise') || lowerPrompt.includes('task')) {
            const createTaskAction: Node = {
                id: getId(),
                type: 'action',
                position: { x: 0, y: 0 },
                data: { label: 'Create Task', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { List: 'General Leads' } }
            };
            nodes.push(createTaskAction);
            edges.push({
                id: `e-${conditionNodeId}-no-${createTaskAction.id}`,
                source: conditionNodeId,
                target: createTaskAction.id,
                sourceHandle: 'no',
                type: 'smoothstep',
                animated: true
            });
        }
    } else if (lowerPrompt.includes('parallel') || lowerPrompt.includes('simultaneous') || lowerPrompt.includes('at the same time')) {
        // Parallel Actions
        const pNodeId = getId();
        const pNode: Node = {
            id: pNodeId,
            type: 'parallel',
            position: { x: 0, y: 0 },
            data: { label: 'Parallel Processing', description: 'Run multiple tasks at once', isConfigured: true, branches: [{ id: 'b1', label: 'Email' }, { id: 'b2', label: 'Database' }, { id: 'b3', label: 'Webhook' }] }
        };
        nodes.push(pNode);
        edges.push({ id: `e-${lastNodeId}-${pNodeId}`, source: lastNodeId, target: pNodeId, type: 'smoothstep', animated: true });

        // Branch 1: Email
        const a1: Node = {
            id: getId(), type: 'action', position: { x: 0, y: 0 },
            data: { label: 'Send Email', description: 'Customer receipt', isConfigured: true, configSummary: { To: '{{trigger.email}}' } }
        };
        nodes.push(a1);
        edges.push({ id: `e-${pNodeId}-b1-${a1.id}`, source: pNodeId, target: a1.id, sourceHandle: 'b1', type: 'smoothstep', animated: true });

        // Branch 2: Database
        const a2: Node = {
            id: getId(), type: 'action', position: { x: 0, y: 0 },
            data: { label: 'Update Record', description: 'Mark as done', isConfigured: true, configSummary: { Table: 'Orders' } }
        };
        nodes.push(a2);
        edges.push({ id: `e-${pNodeId}-b2-${a2.id}`, source: pNodeId, target: a2.id, sourceHandle: 'b2', type: 'smoothstep', animated: true });

        // Branch 3: Webhook
        const a3: Node = {
            id: getId(), type: 'tool', position: { x: 0, y: 0 },
            data: { actionId: 'slack-send-message', description: 'Notify Team', isConfigured: true, configSummary: { Channel: '#general' } }
        };
        nodes.push(a3);
        edges.push({ id: `e-${pNodeId}-b3-${a3.id}`, source: pNodeId, target: a3.id, sourceHandle: 'b3', type: 'smoothstep', animated: true });

    } else {
        // Sequential Actions without condition
        if (lowerPrompt.includes('email')) {
            const actionNode: Node = {
                id: getId(),
                type: 'action',
                position: { x: 0, y: 0 },
                data: { label: 'Send Email', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { To: 'user@example.com' } }
            };
            nodes.push(actionNode);
            edges.push({
                id: `e-${lastNodeId}-${actionNode.id}`,
                source: lastNodeId,
                target: actionNode.id,
                type: 'smoothstep',
                animated: true
            });
            lastNodeId = actionNode.id;
        }

        if (lowerPrompt.includes('task')) {
            const actionNode: Node = {
                id: getId(),
                type: 'action',
                position: { x: 0, y: 0 },
                data: { label: 'Create Task', description: 'Configure this node in the right panel.', isConfigured: true, configSummary: { Title: 'Generated Task' } }
            };
            nodes.push(actionNode);
            edges.push({
                id: `e-${lastNodeId}-${actionNode.id}`,
                source: lastNodeId,
                target: actionNode.id,
                type: 'smoothstep',
                animated: true
            });
        }
    }

    // Default fallback if no actions detected
    if (nodes.length === 1) {
        const actionNode: Node = {
            id: getId(),
            type: 'action',
            position: { x: 0, y: 0 },
            data: { label: 'Send Email', description: 'Configure this node in the right panel.', isConfigured: false }
        };
        nodes.push(actionNode);
        edges.push({
            id: `e-${lastNodeId}-${actionNode.id}`,
            source: lastNodeId,
            target: actionNode.id,
            type: 'smoothstep',
            animated: true
        });
    }

    return { nodes, edges };
};
