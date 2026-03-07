import type { Node, Edge } from '@xyflow/react';

export interface WorkflowSaveData {
    id: string;
    name: string;
    status: 'Draft' | 'Active';
    nodes: Node[];
    edges: Edge[];
    updatedAt: string;
}

export const exportFlowToJson = (workflowData: WorkflowSaveData) => {
    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    // sanitized filename
    const safeName = workflowData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `flow_${safeName}_${workflowData.id}.json`;

    document.body.appendChild(link);
    link.click();

    // cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const saveFlowToLocal = (workflowData: WorkflowSaveData) => {
    try {
        localStorage.setItem(`workflow_${workflowData.id}`, JSON.stringify(workflowData));
        return true;
    } catch (e) {
        console.error('Failed to save to localStorage', e);
        return false;
    }
};

export const getFlowFromLocal = (id: string): WorkflowSaveData | null => {
    try {
        const item = localStorage.getItem(`workflow_${id}`);
        if (!item) return null;
        return JSON.parse(item) as WorkflowSaveData;
    } catch (e) {
        console.error('Failed to parse from localStorage', e);
        return null;
    }
};
