import { CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockRecentActivity } from '../lib/mock';

export function Logs() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Execution Logs</h1>
                    <p className="text-text-secondary mt-1">Detailed history of all workflow runs.</p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="divide-y divide-border">
                    {mockRecentActivity.map((log) => (
                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-background-canvas transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="shrink-0">
                                    {log.status === 'success' ? (
                                        <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-status-success" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-status-error/10 flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-status-error" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-text-primary">{log.workflow}</h4>
                                        <Badge variant={log.status === 'success' ? 'success' : 'error'}>{log.status}</Badge>
                                    </div>
                                    <p className="text-sm text-text-secondary mt-0.5">{log.message}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-text-secondary text-sm justify-end">
                                    <Clock className="w-3.5 h-3.5" />
                                    {log.time}
                                </div>
                                <Button variant="ghost" size="sm" className="mt-1">View Details</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
