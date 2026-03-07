export const mockWorkflows = [
    { id: '1', name: 'Lead Follow-up', status: 'Active', lastRun: '2 mins ago', successRate: 98, runs: 124 },
    { id: '2', name: 'Employee Onboarding', status: 'Active', lastRun: '1 hour ago', successRate: 100, runs: 45 },
    { id: '3', name: 'Support Escalation', status: 'Draft', lastRun: '-', successRate: 0, runs: 0 },
    { id: '4', name: 'Payment Reminder', status: 'Paused', lastRun: '2 days ago', successRate: 95, runs: 890 },
];

export const mockRecentActivity = [
    { id: 'a1', workflow: 'Lead Follow-up', time: '2 mins ago', status: 'success', message: 'Triggered by new lead in CRM' },
    { id: 'a2', workflow: 'Employee Onboarding', time: '1 hour ago', status: 'success', message: 'Sent welcome email to Alex' },
    { id: 'a3', workflow: 'Payment Reminder', time: '2 days ago', status: 'error', message: 'Failed to connect to email provider' },
    { id: 'a4', workflow: 'New Ticket Alert', time: '3 days ago', status: 'success', message: 'Routed ticket #2041 to Support' },
];

export const mockTemplates = [
    { id: 't1', name: 'Lead Follow-up', category: 'Sales', description: 'Automatically follow up with new leads via email and create CRM tasks.' },
    { id: 't2', name: 'Employee Onboarding', category: 'HR', description: 'Send welcome emails, assign training, and setup accounts for new hires.' },
    { id: 't3', name: 'Invoice Reminder', category: 'Finance', description: 'Send automated reminders for overdue invoices.' },
    { id: 't4', name: 'Support Escalation', category: 'Support', description: 'Escalate urgent tickets to the on-call engineer immediately.' },
];

import type { Node, Edge } from '@xyflow/react';

export const mockTemplateFlows: Record<string, { nodes: Node[], edges: Edge[] }> = {
    't1': {
        nodes: [
            { id: 't1-1', type: 'tool_trigger', position: { x: 0, y: 0 }, data: { triggerId: 'hubspot-new-contact', isConfigured: true, configSummary: { List: 'All Subscribers' } } },
            { id: 't1-2', type: 'condition', position: { x: 0, y: 0 }, data: { label: 'Condition', description: 'Check custom field', isConfigured: true, configSummary: { If: 'Lead Score > 50' } } },
            { id: 't1-3', type: 'action', position: { x: 0, y: 0 }, data: { label: 'Send Email', description: 'Send welcome sequence', isConfigured: true, configSummary: { To: '{{trigger.email}}' } } },
            { id: 't1-4', type: 'tool', position: { x: 0, y: 0 }, data: { actionId: 'salesforce-create-contact', isConfigured: true, configSummary: { Lead: '{{trigger.name}}' } } }
        ],
        edges: [
            { id: 'e-t1-1-t1-2', source: 't1-1', target: 't1-2', type: 'smoothstep', animated: true },
            { id: 'e-t1-2-yes-t1-3', source: 't1-2', target: 't1-3', sourceHandle: 'yes', type: 'smoothstep', animated: true },
            { id: 'e-t1-2-no-t1-4', source: 't1-2', target: 't1-4', sourceHandle: 'no', type: 'smoothstep', animated: true }
        ]
    },
    't2': {
        nodes: [
            { id: 't2-1', type: 'trigger', position: { x: 0, y: 0 }, data: { label: 'Employee Added', description: 'Triggered from HR system', isConfigured: true, configSummary: { System: 'Workday' } } },
            { id: 't2-2', type: 'tool', position: { x: 0, y: 0 }, data: { actionId: 'slack-send-message', isConfigured: true, configSummary: { Channel: '#general', Message: 'Welcome {{trigger.name}}!' } } },
            { id: 't2-3', type: 'action', position: { x: 0, y: 0 }, data: { label: 'Create Task', description: 'Assign training', isConfigured: true, configSummary: { Title: 'Security Training' } } }
        ],
        edges: [
            { id: 'e-t2-1-t2-2', source: 't2-1', target: 't2-2', type: 'smoothstep', animated: true },
            { id: 'e-t2-2-t2-3', source: 't2-2', target: 't2-3', type: 'smoothstep', animated: true }
        ]
    }
};
