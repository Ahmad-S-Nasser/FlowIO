import { Search, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { mockTemplates } from '../lib/mock';
import { useNavigate } from 'react-router-dom';

export function Templates() {
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Templates</h1>
                <p className="text-text-secondary mt-1">Start quickly with pre-built workflow templates.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input className="pl-9 bg-white" placeholder="Search templates..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTemplates.map((template) => (
                    <Card key={template.id} className="p-6 flex flex-col h-full hover:border-primary/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                            <Badge variant="info">{template.category}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">{template.name}</h3>
                        <p className="text-text-secondary text-sm mt-2 flex-1">{template.description}</p>
                        <div className="mt-6 pt-4 border-t border-border">
                            <Button className="w-full" onClick={() => navigate('/builder/new?template=' + template.id)}>
                                Use Template
                            </Button>
                        </div>
                    </Card>
                ))}

                {/* Blank Template */}
                <Card className="p-6 flex flex-col items-center justify-center text-center h-full border-dashed border-2 hover:border-primary/50 transition-colors bg-background-canvas cursor-pointer shadow-none" onClick={() => navigate('/builder/new')}>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary">Start from scratch</h3>
                    <p className="text-text-secondary text-sm mt-2">Create a brand new workflow on a blank canvas.</p>
                </Card>
            </div>
        </div>
    );
}
