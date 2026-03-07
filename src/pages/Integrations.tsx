import React, { useState } from 'react';
import { IN_MEMORY_INTEGRATIONS } from '../lib/integrations';
import type { ToolIntegration } from '../lib/integrations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LayoutGrid, Plug, CheckCircle2, Search, Clock, User, Activity } from 'lucide-react';

export default function Integrations() {
    // In a real app, this state would come from a global store/context/db
    const [integrations, setIntegrations] = useState<ToolIntegration[]>(IN_MEMORY_INTEGRATIONS);
    const [searchTerm, setSearchTerm] = useState('');
    const [connectModalOpen, setConnectModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<ToolIntegration | null>(null);

    const filteredIntegrations = integrations.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleConnectClick = (tool: ToolIntegration) => {
        setSelectedTool(tool);
        setConnectModalOpen(true);
    };

    const handleDisconnectClick = (toolId: string) => {
        setIntegrations(prev => prev.map(t => t.id === toolId ? { ...t, status: 'disconnected' } : t));
    };

    const handleConnectSubmit = () => {
        if (!selectedTool) return;
        setIntegrations(prev => prev.map(t => t.id === selectedTool.id ? { ...t, status: 'connected' } : t));
        setConnectModalOpen(false);
        setSelectedTool(null);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2 flex items-center gap-3">
                        <Plug className="w-8 h-8 text-primary" />
                        Integrations
                    </h1>
                    <p className="text-text-secondary text-base lg:text-lg max-w-2xl">
                        Connect external tools and services to use them as Actions within your workflows.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-card p-4 shadow-sm border border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                        placeholder="Search integration (e.g. Salesforce)..."
                        className="pl-9 h-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((tool) => {
                    const Icon = tool.icon;
                    const isConnected = tool.status === 'connected';

                    return (
                        <Card key={tool.id} className="p-6 flex flex-col group hover:shadow-lg transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: tool.color }}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {isConnected ? (
                                    <Badge variant="success" className="bg-status-success/10 text-status-success border-status-success/20">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                                    </Badge>
                                ) : (
                                    <Badge variant="default" className="bg-background-canvas text-text-secondary border-border">
                                        Not Connected
                                    </Badge>
                                )}
                            </div>

                            <h3 className="font-bold text-lg text-text-primary mb-2">{tool.name}</h3>

                            {isConnected ? (
                                <div className="space-y-3 mb-6 flex-grow">
                                    <div className="flex items-center gap-2 text-sm text-text-secondary bg-background-canvas p-2 rounded-md">
                                        <User className="w-4 h-4 text-primary shrink-0" />
                                        <span className="truncate">{tool.connectedAccount || 'flowio_admin_user'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-text-muted px-1">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span>Last sync: {tool.lastSync || '2 mins ago'}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-grow">
                                    {tool.description}
                                </p>
                            )}

                            <div className="pt-4 border-t border-border mt-auto flex items-center justify-between">
                                <span className="text-xs font-medium text-text-muted">
                                    {tool.triggers?.length || 0} triggers · {tool.actions?.length || 0} actions
                                </span>
                                {isConnected ? (
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" className="text-status-info hover:bg-status-info/10 border-border hover:border-status-info/20" onClick={() => alert('Testing connection... Success!')}>
                                            <Activity className="w-4 h-4 mr-1" /> Test
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDisconnectClick(tool.id)} className="text-status-error hover:bg-status-error/10 border-transparent hover:border-status-error/20">
                                            Disconnect
                                        </Button>
                                    </div>
                                ) : (
                                    <Button variant="primary" size="sm" onClick={() => handleConnectClick(tool)}>
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {filteredIntegrations.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                    <LayoutGrid className="w-12 h-12 text-text-muted mb-4 opacity-50" />
                    <p className="text-text-secondary text-lg">No integrations found matching "{searchTerm}"</p>
                </div>
            )}

            {/* Connect Modal */}
            <Modal isOpen={connectModalOpen} onClose={() => setConnectModalOpen(false)} title={`Connect ${selectedTool?.name}`}>
                {selectedTool && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center p-6 bg-background-canvas rounded-xl mb-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md" style={{ backgroundColor: selectedTool.color }}>
                                {React.createElement(selectedTool.icon, { className: 'w-8 h-8' })}
                            </div>
                            <h3 className="font-bold text-lg mb-1">Authenticate with {selectedTool.name}</h3>
                            <p className="text-sm text-text-secondary">Provide your API key to allow Flowio to execute actions on your behalf.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-primary">API Key</label>
                                <Input type="password" placeholder={`Enter ${selectedTool.name} API Key...`} />
                            </div>
                            {selectedTool.name === 'Salesforce' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-primary">Instance URL</label>
                                    <Input type="text" placeholder="https://your-instance.my.salesforce.com" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setConnectModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleConnectSubmit} className="bg-primary hover:bg-primary-hover text-white">
                                Save Connection
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
