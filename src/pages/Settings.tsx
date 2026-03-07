import { Card } from '../components/ui/Card';

export function Settings() {
    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your account and integrations.</p>
            </div>
            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">Integrations</h3>
                <p className="text-text-secondary">Future integrations (Slack, Email, CRM) will be configured here.</p>
            </Card>
            <Card className="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-4">API Keys</h3>
                <p className="text-text-secondary">Manage API access to your workflows.</p>
            </Card>
        </div>
    );
}
