// components/layout/AppLayoutClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/Topbar';

interface AppLayoutClientProps {
    children: React.ReactNode;
    user: {
        fullName: string;
        role: string;
    };
}

export default function AppLayoutClient({ children, user }: AppLayoutClientProps) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            setSidebarCollapsed(saved === 'true');
        } else if (window.innerWidth < 768) {
            setSidebarCollapsed(true);
        }
    }, []);

    // Handle screen size responsiveness on mount and resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarCollapsed(true);
            } else {
                const saved = localStorage.getItem('sidebarCollapsed');
                if (saved !== null) {
                    setSidebarCollapsed(saved === 'true');
                } else {
                    setSidebarCollapsed(false);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Automatically collapse sidebar on mobile when route changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarCollapsed(true);
        }
    }, [pathname]);

    const toggleSidebar = () => {
        setSidebarCollapsed(prev => {
            const nextVal = !prev;
            localStorage.setItem('sidebarCollapsed', String(nextVal));
            return nextVal;
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={toggleSidebar}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar
                    onToggleSidebar={toggleSidebar}
                    collapsed={sidebarCollapsed}
                    user={user}
                />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    );
}
