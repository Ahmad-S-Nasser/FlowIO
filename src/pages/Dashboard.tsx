import { CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mockWorkflows, mockRecentActivity } from '../lib/mock';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Welcome Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Welcome back</h1>
                    <p className="text-text-secondary mt-1">Here's what's happening with your workflows today.</p>
                </div>
                <Button size="lg" onClick={() => navigate('/builder/new')}>
                    <Plus className="w-5 h-5 mr-1" />
                    Create Workflow
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <h3 className="text-text-secondary text-sm font-medium">Total Workflows</h3>
                    <p className="text-3xl font-bold mt-2">12</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-text-secondary text-sm font-medium">Active Workflows</h3>
                    <p className="text-3xl font-bold mt-2 text-primary">8</p>
                </Card>
                <Card className="p-6 break-words">
                    <h3 className="text-text-secondary text-sm font-medium">Runs Today</h3>
                    <p className="text-3xl font-bold mt-2">1,204</p>
                </Card>
                <Card className="p-6">
                    <h3 className="text-text-secondary text-sm font-medium">Success Rate</h3>
                    <p className="text-3xl font-bold mt-2 text-status-success">98.5%</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Workflows */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold">Recent Workflows</h2>
                    <Card className="overflow-hidden">
                        <div className="divide-y divide-border">
                            {mockWorkflows.map((wf) => (
                                <div key={wf.id} className="p-4 flex items-center justify-between hover:bg-background-canvas transition-colors">
                                    <div>
                                        <h4 className="font-semibold text-text-primary">{wf.name}</h4>
                                        <p className="text-sm text-text-secondary mt-0.5">Last run: {wf.lastRun}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={wf.status === 'Active' ? 'success' : wf.status === 'Draft' ? 'default' : 'warning'}>
                                            {wf.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/builder/${wf.id}`)}>
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">Recent Activity</h2>
                    <Card className="p-5">
                        <div className="space-y-6">
                            {mockRecentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="mt-0.5 shrink-0">
                                        {activity.status === 'success' ? (
                                            <CheckCircle2 className="w-5 h-5 text-status-success" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-status-error" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{activity.workflow}</p>
                                        <p className="text-sm text-text-secondary line-clamp-2">{activity.message}</p>
                                        <p className="text-xs text-text-secondary mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
