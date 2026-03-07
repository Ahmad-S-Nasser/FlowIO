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
