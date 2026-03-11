import { useState, useRef, useEffect } from 'react';
import { Bell, Search, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = [
    { id: 1, type: 'success', title: 'Workflow Completed', message: 'Data sync to Salesforce finished successfully.', time: '2m ago', read: false, link: '/logs' },
    { id: 2, type: 'warning', title: 'API Rate Limit', message: 'Approaching rate limit for GitHub API.', time: '15m ago', read: false, link: '/workflows' },
    { id: 3, type: 'error', title: 'Connection Failed', message: 'Could not connect to PostgreSQL database.', time: '1h ago', read: true, link: '/integrations' },
];

export function Topbar() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const notificationRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-status-success" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-status-warning" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-status-error" />;
            default: return <Bell className="w-5 h-5 text-text-secondary" />;
        }
    };

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
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-background-canvas hover:text-text-primary'}`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-border flex items-center justify-between bg-background-canvas/50">
                                <h3 className="font-semibold text-text-primary">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            className={`w-full text-left p-4 border-b border-border last:border-0 hover:bg-background-canvas/80 active:bg-background-canvas transition-colors flex gap-3 cursor-pointer group ${!notification.read ? 'bg-primary/5' : ''}`}
                                            onClick={() => {
                                                setNotifications(notifications.map(n =>
                                                    n.id === notification.id ? { ...n, read: true } : n
                                                ));
                                                setShowNotifications(false);
                                                navigate(notification.link);
                                            }}
                                        >
                                            <div className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm font-medium truncate group-hover:text-primary transition-colors ${!notification.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                                                        {notification.time}
                                                    </span>
                                                </div>
                                                <p className={`text-xs line-clamp-2 ${!notification.read ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"></div>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-text-secondary">
                                        <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">You're all caught up!</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-border text-center bg-background-canvas/50">
                                <button
                                    className="text-sm text-primary hover:text-primary-hover font-medium transition-colors w-full"
                                    onClick={() => {
                                        setShowNotifications(false);
                                        navigate('/activities');
                                    }}
                                >
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
