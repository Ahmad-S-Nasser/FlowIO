import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
    return (
        <div className="h-screen w-screen flex overflow-hidden bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-auto bg-background-canvas">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
