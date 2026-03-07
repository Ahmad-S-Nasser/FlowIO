import { Plus, Search, Filter, Play, Pause, Trash2, Edit2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { mockWorkflows } from '../lib/mock';
import { useNavigate } from 'react-router-dom';

export function Workflows() {
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Workflows</h1>
                    <p className="text-text-secondary mt-1">Manage and monitor all your automated processes.</p>
                </div>
                <Button size="lg" onClick={() => navigate('/builder/new')}>
                    <Plus className="w-5 h-5 mr-1" />
                    Create Workflow
                </Button>
            </div>

            <Card className="p-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <Input className="pl-9" placeholder="Search workflows..." />
                    </div>
                    <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border text-sm text-text-secondary">
                                <th className="pb-3 px-4 font-medium">Name</th>
                                <th className="pb-3 px-4 font-medium">Status</th>
                                <th className="pb-3 px-4 font-medium">Last Run</th>
                                <th className="pb-3 px-4 font-medium">Success Rate</th>
                                <th className="pb-3 px-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockWorkflows.map((wf) => (
                                <tr key={wf.id} className="hover:bg-background-canvas/50 transition-colors">
                                    <td className="py-4 px-4 font-medium text-text-primary">{wf.name}</td>
                                    <td className="py-4 px-4">
                                        <Badge variant={wf.status === 'Active' ? 'success' : wf.status === 'Draft' ? 'default' : 'warning'}>
                                            {wf.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4 text-text-secondary text-sm">{wf.lastRun}</td>
                                    <td className="py-4 px-4 text-text-primary text-sm">{wf.successRate}%</td>
                                    <td className="py-4 px-4 text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/builder/${wf.id}`)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        {wf.status === 'Active' ? (
                                            <Button variant="ghost" size="sm" className="text-status-warning hover:text-status-warning hover:bg-status-warning/10">
                                                <Pause className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="text-status-success hover:text-status-success hover:bg-status-success/10">
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-status-error hover:text-status-error hover:bg-status-error/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
