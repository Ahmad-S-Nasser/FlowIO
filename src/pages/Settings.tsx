import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { User, Building, Users, Key, Plus, Trash2, Copy } from 'lucide-react';

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'workspace', label: 'Workspace', icon: Building },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'apikeys', label: 'API Keys', icon: Key },
];

export function Settings() {
    const [activeTab, setActiveTab] = useState('profile');

    // Stub states for forms
    const [profileName, setProfileName] = useState('Jane Doe');
    const [profileEmail, setProfileEmail] = useState('jane@example.com');

    const renderProfile = () => (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Personal Information</h3>
                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Full Name</label>
                        <Input value={profileName} onChange={(e: any) => setProfileName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Email Address</label>
                        <Input type="email" value={profileEmail} onChange={(e: any) => setProfileEmail(e.target.value)} />
                    </div>
                    <Button>Save Changes</Button>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Password</h3>
                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Current Password</label>
                        <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">New Password</label>
                        <Input type="password" placeholder="••••••••" />
                    </div>
                    <Button variant="outline">Update Password</Button>
                </div>
            </Card>

            <Card className="p-6 border-status-error/30">
                <h3 className="text-lg font-bold text-status-error mb-2">Danger Zone</h3>
                <p className="text-text-secondary text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="outline" className="text-status-error border-status-error/30 hover:bg-status-error/10">
                    Delete Account
                </Button>
            </Card>
        </div>
    );

    const renderWorkspace = () => (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Workspace Settings</h3>
                <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Workspace Name</label>
                        <Input defaultValue="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">Workspace Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center border border-dashed border-border text-text-secondary">
                                <Building className="w-6 h-6" />
                            </div>
                            <Button variant="outline" size="sm">Upload Logo</Button>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium text-text-primary">Timezone</label>
                        <select className="flex h-10 w-full rounded-btn border border-border bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                            <option>UTC (Coordinated Universal Time)</option>
                            <option>EST (Eastern Standard Time)</option>
                            <option>PST (Pacific Standard Time)</option>
                        </select>
                    </div>
                    <Button>Save Workspace</Button>
                </div>
            </Card>
        </div>
    );

    const renderTeam = () => (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">Team Members</h3>
                        <p className="text-sm text-text-secondary">Manage who has access to this workspace.</p>
                    </div>
                    <Button><Plus className="w-4 h-4 mr-2" /> Invite Member</Button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background-canvas">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                JD
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">Jane Doe (You)</p>
                                <p className="text-xs text-text-secondary">jane@example.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="success">Owner</Badge>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background-canvas">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-status-info/10 flex items-center justify-center text-status-info font-bold">
                                JS
                            </div>
                            <div>
                                <p className="font-medium text-text-primary">John Smith</p>
                                <p className="text-xs text-text-secondary">john@example.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="default">Admin</Badge>
                            <Button variant="outline" size="sm" className="h-8">Edit Role</Button>
                            <Button variant="outline" size="sm" className="h-8 text-status-error hover:bg-status-error/10"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );

    const renderApiKeys = () => (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-text-primary">API Keys</h3>
                        <p className="text-sm text-text-secondary">Manage API keys to authenticate requests from your apps.</p>
                    </div>
                    <Button><Plus className="w-4 h-4 mr-2" /> Generate New Key</Button>
                </div>

                <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg bg-background-canvas">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-medium text-text-primary flex items-center gap-2">
                                    Production Key <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">Active</Badge>
                                </h4>
                                <p className="text-xs text-text-secondary">Created on Oct 12, 2025</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-status-error hover:bg-status-error/10">Revoke</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <code className="flex-1 px-3 py-2 bg-background rounded text-sm text-text-secondary font-mono border border-border">
                                sk_live_51Nw************************y38A
                            </code>
                            <Button variant="outline" className="h-10 px-3"><Copy className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="p-4 border border-border rounded-lg bg-background-canvas">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-medium text-text-primary flex items-center gap-2">
                                    Development Key <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">Test</Badge>
                                </h4>
                                <p className="text-xs text-text-secondary">Created on Oct 10, 2025</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-status-error hover:bg-status-error/10">Revoke</Button>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <code className="flex-1 px-3 py-2 bg-background rounded text-sm text-text-secondary font-mono border border-border">
                                sk_test_51Nw************************d9Bz
                            </code>
                            <Button variant="outline" className="h-10 px-3"><Copy className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your account, team, and workspace preferences.</p>
            </div>

            <div className="flex flex-1 gap-8 overflow-hidden">
                {/* Left Sidebar (Tabs) */}
                <div className="w-64 shrink-0 space-y-1">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-background-canvas hover:text-text-primary'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-tertiary'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pb-12 pr-4">
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'workspace' && renderWorkspace()}
                    {activeTab === 'team' && renderTeam()}
                    {activeTab === 'apikeys' && renderApiKeys()}
                </div>
            </div>
        </div>
    );
}
