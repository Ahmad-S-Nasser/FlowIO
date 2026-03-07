import { Database, MessageSquare, Briefcase, Server, Globe, FileSpreadsheet, Send, Building2 } from 'lucide-react';

export type IntegrationStatus = 'connected' | 'disconnected';

export interface FieldSchema {
    name: string;
    label: string;
    type: 'string' | 'text' | 'select' | 'boolean';
    options?: { label: string; value: string }[];
    required: boolean;
    placeholder?: string;
}

export interface ToolAction {
    id: string; // e.g. "slack_send_message"
    name: string; // e.g. "Send Message"
    description: string;
    fields: FieldSchema[];
}

export interface ToolTrigger {
    id: string; // e.g. "pg_new_row"
    name: string; // e.g. "New Row"
    description: string;
    fields: FieldSchema[];
}

export interface ToolIntegration {
    id: string; // e.g. "slack"
    name: string; // e.g. "Slack"
    description: string;
    icon: any; // Lucide icon or similar
    color: string; // e.g. "blue" or hex code for the left border
    status: IntegrationStatus;
    connectedAccount?: string; // Phase 6 addition
    lastSync?: string; // Phase 6 addition
    triggers?: ToolTrigger[];
    actions: ToolAction[];
}

// Mock Data for Integrations
export const IN_MEMORY_INTEGRATIONS: ToolIntegration[] = [
    {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Customer relationship management system.',
        icon: Briefcase,
        color: '#00A1E0',
        status: 'disconnected',
        triggers: [
            {
                id: 'sf_new_lead',
                name: 'New Lead',
                description: 'Triggers when a new lead is created.',
                fields: [
                    { name: 'leadSource', label: 'Lead Source Filter', type: 'string', required: false, placeholder: 'e.g. Web' }
                ]
            }
        ],
        actions: [
            {
                id: 'sf_create_contact',
                name: 'Create Contact',
                description: 'Creates a new contact in Salesforce.',
                fields: [
                    { name: 'firstName', label: 'First Name', type: 'string', required: true },
                    { name: 'lastName', label: 'Last Name', type: 'string', required: true },
                    { name: 'email', label: 'Email Address', type: 'string', required: true },
                    { name: 'company', label: 'Company', type: 'string', required: false }
                ]
            },
            {
                id: 'sf_update_lead',
                name: 'Update Lead',
                description: 'Updates an existing lead.',
                fields: [
                    { name: 'leadId', label: 'Lead ID', type: 'string', required: true },
                    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'New', value: 'new' }, { label: 'Working', value: 'working' }, { label: 'Closed', value: 'closed' }], required: true }
                ]
            }
        ]
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Marketing, sales, and service software.',
        icon: Server,
        color: '#FF7A59',
        status: 'disconnected',
        triggers: [
            {
                id: 'hs_deal_won',
                name: 'Deal Won',
                description: 'Triggers when a deal is moved to Closed Won.',
                fields: [
                    { name: 'pipeline', label: 'Pipeline', type: 'string', required: false }
                ]
            }
        ],
        actions: [
            {
                id: 'hs_create_deal',
                name: 'Create Deal',
                description: 'Creates a new deal pipeline record.',
                fields: [
                    { name: 'dealName', label: 'Deal Name', type: 'string', required: true },
                    { name: 'amount', label: 'Amount', type: 'string', required: true },
                    { name: 'pipeline', label: 'Pipeline', type: 'string', required: true }
                ]
            },
            {
                id: 'hs_add_contact',
                name: 'Add Contact',
                description: 'Adds a new contact to HubSpot CRM.',
                fields: [
                    { name: 'email', label: 'Email', type: 'string', required: true },
                    { name: 'firstName', label: 'First Name', type: 'string', required: false }
                ]
            }
        ]
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Team communication and messaging.',
        icon: MessageSquare,
        color: '#E01E5A',
        status: 'disconnected',
        triggers: [
            {
                id: 'slack_new_message',
                name: 'New Message',
                description: 'Triggers on new messages in a channel.',
                fields: [
                    { name: 'channel', label: 'Channel', type: 'string', required: true }
                ]
            }
        ],
        actions: [
            {
                id: 'slack_send_message',
                name: 'Send Message',
                description: 'Sends a message to a channel or user.',
                fields: [
                    { name: 'channel', label: 'Channel / User ID', type: 'string', required: true, placeholder: '#general or @user' },
                    { name: 'message', label: 'Message Text', type: 'text', required: true }
                ]
            }
        ]
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        description: 'Relational database management.',
        icon: Database,
        color: '#336791',
        status: 'connected',
        connectedAccount: 'prod-db-cluster-1',
        lastSync: '10 mins ago',
        triggers: [
            {
                id: 'pg_row_inserted',
                name: 'New Row Inserted',
                description: 'Triggers when a new row is added to a table.',
                fields: [
                    { name: 'table', label: 'Table', type: 'string', required: true, placeholder: 'e.g. users' }
                ]
            },
            {
                id: 'pg_row_updated',
                name: 'Row Updated',
                description: 'Triggers when an existing row is updated.',
                fields: [
                    { name: 'table', label: 'Table', type: 'string', required: true },
                    { name: 'condition', label: 'Filter Condition (Optional)', type: 'string', required: false, placeholder: 'status = \'active\'' }
                ]
            }
        ],
        actions: [
            {
                id: 'pg_insert_row',
                name: 'Insert Row',
                description: 'Inserts a single row into a table.',
                fields: [
                    { name: 'table', label: 'Table Name', type: 'string', required: true },
                    { name: 'data', label: 'JSON Data', type: 'text', required: true, placeholder: '{"col1": "val1"}' }
                ]
            },
            {
                id: 'pg_update_record',
                name: 'Update Record',
                description: 'Updates matched records in a table.',
                fields: [
                    { name: 'table', label: 'Table Name', type: 'string', required: true },
                    { name: 'matchColumn', label: 'Match Column', type: 'string', required: true },
                    { name: 'matchValue', label: 'Match Value', type: 'string', required: true },
                    { name: 'updateData', label: 'JSON Data to Update', type: 'text', required: true }
                ]
            }
        ]
    },
    {
        id: 'http_api',
        name: 'HTTP API',
        description: 'Make generic REST API calls.',
        icon: Globe,
        color: '#6B7280',
        status: 'connected',
        connectedAccount: 'Default Client',
        lastSync: 'Just now',
        actions: [
            {
                id: 'http_get',
                name: 'GET Request',
                description: 'Perform a GET HTTP request.',
                fields: [
                    { name: 'url', label: 'Endpoint URL', type: 'string', required: true },
                    { name: 'headers', label: 'Headers (JSON)', type: 'text', required: false }
                ]
            },
            {
                id: 'http_post',
                name: 'POST Request',
                description: 'Perform a POST HTTP request.',
                fields: [
                    { name: 'url', label: 'Endpoint URL', type: 'string', required: true },
                    { name: 'body', label: 'JSON Body', type: 'text', required: true }
                ]
            }
        ]
    },
    {
        id: 'webhook',
        name: 'Webhook',
        description: 'Receive incoming web requests.',
        icon: Send,
        color: '#8B5CF6',
        status: 'connected',
        connectedAccount: 'Webhook Listener',
        lastSync: 'Active',
        triggers: [
            {
                id: 'webhook_receive',
                name: 'Catch Hook',
                description: 'Triggers when data is sent to a unique URL.',
                fields: [
                    { name: 'path', label: 'Custom Path (Optional)', type: 'string', required: false }
                ]
            }
        ],
        actions: []
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        description: 'Create and update spreadsheet data.',
        icon: FileSpreadsheet,
        color: '#10B981',
        status: 'disconnected',
        triggers: [
            {
                id: 'gs_new_row',
                name: 'New Row Added',
                description: 'Triggers when a new row is appended to the bottom of a sheet.',
                fields: [
                    { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'string', required: true },
                    { name: 'sheetName', label: 'Sheet Name', type: 'string', required: true }
                ]
            }
        ],
        actions: [
            {
                id: 'gs_add_row',
                name: 'Add Row',
                description: 'Appends a new row to a sheet.',
                fields: [
                    { name: 'spreadsheetId', label: 'Spreadsheet ID', type: 'string', required: true },
                    { name: 'sheetName', label: 'Sheet Name', type: 'string', required: true },
                    { name: 'values', label: 'Values (Comma separated)', type: 'string', required: true }
                ]
            }
        ]
    },
    {
        id: 'sap_erp',
        name: 'SAP ERP',
        description: 'Enterprise resource planning connection.',
        icon: Building2,
        color: '#008FD3',
        status: 'disconnected',
        actions: [
            {
                id: 'sap_create_invoice',
                name: 'Create Invoice',
                description: 'Generate a new invoice record.',
                fields: [
                    { name: 'customerId', label: 'Customer ID', type: 'string', required: true },
                    { name: 'amount', label: 'Total Amount', type: 'string', required: true },
                    { name: 'items', label: 'Line Items (JSON)', type: 'text', required: true }
                ]
            }
        ]
    }
];

// Helper to get tool by action id
export const getToolByActionId = (actionId: string): ToolIntegration | undefined => {
    return IN_MEMORY_INTEGRATIONS.find(tool => tool.actions?.some(a => a.id === actionId));
};

// Helper to get tool by trigger id
export const getToolByTriggerId = (triggerId: string): ToolIntegration | undefined => {
    return IN_MEMORY_INTEGRATIONS.find(tool => tool.triggers?.some(t => t.id === triggerId));
};

// Helper to get tool action by id
export const getToolActionById = (actionId: string): ToolAction | undefined => {
    for (const tool of IN_MEMORY_INTEGRATIONS) {
        if (!tool.actions) continue;
        const action = tool.actions.find(a => a.id === actionId);
        if (action) return action;
    }
    return undefined;
};

// Helper to get tool trigger by id
export const getToolTriggerById = (triggerId: string): ToolTrigger | undefined => {
    for (const tool of IN_MEMORY_INTEGRATIONS) {
        if (!tool.triggers) continue;
        const trigger = tool.triggers.find(t => t.id === triggerId);
        if (trigger) return trigger;
    }
    return undefined;
};
