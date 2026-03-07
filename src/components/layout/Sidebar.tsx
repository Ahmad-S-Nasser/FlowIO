import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Settings, Zap, LayoutGrid, Plug, Webhook } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Workflows', path: '/workflows', icon: GitMerge },
    { name: 'Templates', path: '/templates', icon: LayoutGrid },
    { name: 'Integrations', path: '/integrations', icon: Plug },
    { name: 'Logs', path: '/logs', icon: Webhook },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar() {
    return (
        <div className="w-64 bg-background-card border-r border-border h-full flex flex-col shrink-0">
            <div className="p-6 flex items-center gap-2 text-primary font-bold text-2xl">
                <Zap className="w-8 h-8 fill-primary" />
                Flowio
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-text-secondary hover:bg-background-canvas hover:text-text-primary"
                                )
                            }
                        >
                            <Icon className="w-5 h-5" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">
                        US
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-text-primary">User</span>
                        <span className="text-xs text-text-secondary">Free Plan</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
