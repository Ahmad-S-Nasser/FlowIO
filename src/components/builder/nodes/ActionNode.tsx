import { Handle, Position, useReactFlow } from '@xyflow/react';
import { 
    Mail, CheckSquare, AlertTriangle, X, UserCheck, Edit, Bell, Clock, Wand2, Code, Search, Layers,
    Brain, Database, FileSearch, MessageCircle, Globe, MailSearch, Star, ListOrdered, Tags, Smile,
    Mic, Volume2, UserCircle, HeartPulse, ScanFace, Ear, Link2, GitFork, ToggleRight, AlignJustify, Combine,
    Sparkles
} from 'lucide-react';
import { AddBlockMenu } from '../AddBlockMenu';

const AI_LABELS = new Set([
    'LLM', 'RAG', 'AI Search', 'Chatbot', 'Web Scraper', 'Email Scanner',
    'Recommender', 'Ranker', 'AI Classifier', 'Tone Analyzer',
    'STT (Speech to Text)', 'TTS (Text to Speech)', 'Speaker Detection', 'Voice Sentiment',
    'Face Recognition', 'Ear Recognition',
    'Prompt Linker', 'Router', 'Model Switcher', 'Normalizer', 'Aggregator'
]);

export function ActionNode({ id, data }: any) {
    const { deleteElements } = useReactFlow();
    const isAI = AI_LABELS.has(data.label);

    let Icon = Mail;
    if (data.label === 'Create Task') Icon = CheckSquare;
    if (data.label === 'Request Approval') Icon = UserCheck;
    if (data.label === 'Update Record') Icon = Edit;
    if (data.label === 'Send Notification') Icon = Bell;
    if (data.label === 'Delay') Icon = Clock;
    if (data.label === 'Transform Data') Icon = Wand2;
    if (data.label === 'Set Variable') Icon = Code;
    if (data.label === 'Query Rows') Icon = Search;
    if (data.label === 'Call Workflow') Icon = Layers;
    
    // AI Models
    if (data.label === 'LLM') Icon = Brain;
    if (data.label === 'RAG') Icon = Database;
    if (data.label === 'AI Search') Icon = FileSearch;
    if (data.label === 'Chatbot') Icon = MessageCircle;
    if (data.label === 'Web Scraper') Icon = Globe;
    if (data.label === 'Email Scanner') Icon = MailSearch;
    if (data.label === 'Recommender') Icon = Star;
    if (data.label === 'Ranker') Icon = ListOrdered;
    if (data.label === 'AI Classifier') Icon = Tags;
    if (data.label === 'Tone Analyzer') Icon = Smile;
    
    // Speech & Vision
    if (data.label === 'STT (Speech to Text)') Icon = Mic;
    if (data.label === 'TTS (Text to Speech)') Icon = Volume2;
    if (data.label === 'Speaker Detection') Icon = UserCircle;
    if (data.label === 'Voice Sentiment') Icon = HeartPulse;
    if (data.label === 'Face Recognition') Icon = ScanFace;
    if (data.label === 'Ear Recognition') Icon = Ear;
    
    // AI Linkers
    if (data.label === 'Prompt Linker') Icon = Link2;
    if (data.label === 'Router') Icon = GitFork;
    if (data.label === 'Model Switcher') Icon = ToggleRight;
    if (data.label === 'Normalizer') Icon = AlignJustify;
    if (data.label === 'Aggregator') Icon = Combine;

    // Explicit color mapping for Tailwind v4
    const bgClass = isAI ? 'bg-ai-accent' : 'bg-status-info';
    const textClass = isAI ? 'text-ai-accent' : 'text-status-info';

    return (
        <div className="relative group font-sans">
            <div className={`w-[190px] h-[68px] bg-white rounded-lg border border-border shadow-soft flex items-center p-2.5 gap-3 transition-all hover:border-primary/40 hover:shadow-node-hover ${isAI ? 'ring-1 ring-ai-accent/10 border-ai-accent/20' : ''}`}>
                <div className={`w-11 h-11 rounded-md ${bgClass} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0 pr-1 text-left">
                    <div className="text-[11px] font-bold text-text-primary leading-[1.2] line-clamp-2">
                        {data.label || 'Action'}
                    </div>
                    <div className={`text-[9px] font-semibold ${textClass} uppercase tracking-tight mt-0.5 flex items-center gap-1`}>
                        {isAI ? 'AI Core' : 'Action'}
                        {isAI && <Sparkles className="w-2 h-2 opacity-70" />}
                    </div>
                </div>

                {/* Status Indicator (Corner) */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!data.isConfigured && <AlertTriangle className="w-3 h-3 text-status-warning" />}
                </div>

                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteElements({ nodes: [{ id }] });
                    }}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border border-border/60 shadow-sm rounded-full flex items-center justify-center text-text-muted hover:text-status-error hover:border-status-error opacity-0 group-hover:opacity-100 transition-all z-20"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <Handle type="target" position={Position.Left} className={isAI ? 'handle-secondary handle-left' : 'handle-info handle-left'} />
            <Handle type="source" position={Position.Right} className={isAI ? 'handle-secondary handle-right' : 'handle-info handle-right'} />

            <AddBlockMenu sourceId={id} />
        </div>
    );
}
