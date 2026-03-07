import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useState } from 'react';

interface AIPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => Promise<void>;
}

export function AIPromptModal({ isOpen, onClose, onGenerate }: AIPromptModalProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            await onGenerate(prompt);
            setPrompt('');
            onClose();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Generate with AI">
            <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-card border border-primary/20 flex gap-3">
                    <div className="mt-0.5"><Sparkles className="w-5 h-5 text-primary" /></div>
                    <div>
                        <h4 className="font-bold text-sm text-primary mb-1">Describe your workflow</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                            Type a natural language description of what you want to build.
                            For example: <strong>"When a form is submitted, if the budget is over $1k, send an intro email, otherwise create a follow-up task."</strong>
                        </p>
                    </div>
                </div>

                <textarea
                    className="w-full h-32 p-3 border border-border rounded-btn text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                    placeholder="E.g., Every day at 9am, check if there are new leads..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                    autoFocus
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancel</Button>
                    <Button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover border-none text-white shadow-md shadow-primary/20"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate Flow
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
