'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PlaidLinkButton } from '@/components/plaid/plaid-link-button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import {
    LayoutDashboard,
    DollarSign,
    CreditCard,
    TrendingUp,
    Bell,
    Settings,
    LogOut,
    Building2,
    ChevronRight,
    Menu,
    X,
    FileText,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cash Flow', href: '/dashboard/cash-flow', icon: DollarSign },
    { name: 'Expenses', href: '/dashboard/expenses', icon: CreditCard },
    { name: 'Forecasts', href: '/dashboard/forecasts', icon: TrendingUp },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function UserSection() {
    const { data: session } = useSession()

    const user = session?.user
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' })
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                    {user?.image ? (
                        <img src={user.image} alt={user.name || ''} className="w-10 h-10 rounded-full" />
                    ) : (
                        <span className="text-sm font-bold text-white">{initials}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                        {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                        {user?.email || 'Not signed in'}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={handleSignOut}
                    title="Sign out"
                >
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // Check if user needs onboarding (only on first visit)
    useEffect(() => {
        if (session?.user && typeof window !== 'undefined') {
            const hasCompletedOnboarding = localStorage.getItem('seedvalidator_onboarding_complete')
            if (!hasCompletedOnboarding) {
                // Small delay to let the page load first
                const timer = setTimeout(() => {
                    setShowOnboarding(true)
                }, 500)
                return () => clearTimeout(timer)
            }
        }
    }, [session?.user])

    const handleOnboardingComplete = () => {
        setShowOnboarding(false)
        localStorage.setItem('seedvalidator_onboarding_complete', 'true')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Onboarding Modal */}
            <OnboardingModal
                isOpen={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
                userName={session?.user?.name?.split(' ')[0]}
            />
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
                "bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">SeedValidator</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1 p-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href))

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-2 border-blue-500"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5",
                                    isActive ? "text-blue-400" : "text-slate-500"
                                )} />
                                {item.name}
                                {isActive && (
                                    <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom section */}
                <UserSection />
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {navigation.find(item =>
                                    pathname === item.href ||
                                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                )?.name || 'Dashboard'}
                            </h1>
                            <p className="text-sm text-slate-500">Last updated: Just now</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" className="hidden md:flex">
                            <Bell className="w-4 h-4 mr-2" />
                            3 Alerts
                        </Button>
                        {session?.user?.id ? (
                            <PlaidLinkButton
                                companyId={session.user.companyId || session.user.id}
                                userId={session.user.id}
                                size="sm"
                                onSuccess={() => window.location.reload()}
                            />
                        ) : (
                            <Button variant="gradient" size="sm" disabled>
                                Connect Bank
                            </Button>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
