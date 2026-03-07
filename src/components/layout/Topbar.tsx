import { Bell, Search } from 'lucide-react';

export function Topbar() {
    return (
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shrink-0 z-10">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        type="text"
                        placeholder="Search workflows, templates, or logs..."
                        className="w-full pl-10 pr-4 py-2 bg-background-canvas border-none rounded-btn text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-text-secondary hover:bg-background-canvas hover:text-text-primary rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
}
