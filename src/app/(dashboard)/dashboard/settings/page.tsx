'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlaidLinkDemoButton } from '@/components/plaid/plaid-link-button'
import {
    User,
    Building2,
    CreditCard,
    Bell,
    Shield,
    Users,
    Palette,
    Download,
    ChevronRight,
    Check,
    Plus,
    Trash2,
    Loader2,
    RefreshCw,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const settingsSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'company', name: 'Company', icon: Building2 },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'export', name: 'Data Export', icon: Download },
]

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function SettingsPage() {
    const { data: session } = useSession()
    const [activeSection, setActiveSection] = useState('profile')
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)

    // Fetch dashboard data for accounts
    const { data: dashboardData, mutate } = useSWR('/api/dashboard', fetcher)

    // Initialize form data from session
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        industry: 'SaaS / Technology',
        currency: 'USD',
        fiscalYearStart: 'January',
        runwayAlert: '6',
        spendingAlert: '50',
    })

    // Update form data when session loads
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
            }))
        }
    }, [session])

    const accounts = dashboardData?.accounts || []

    // Get initials from name
    const initials = formData.name
        ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U'

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
    }

    const handleDisconnectBank = async (accountId: string) => {
        // In production, this would call the API to disconnect the bank
        console.log('Disconnecting account:', accountId)
        mutate()
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <Card className="lg:col-span-1 h-fit">
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        activeSection === section.id
                                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                            : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                    )}
                                >
                                    <section.icon className="w-4 h-4" />
                                    {section.name}
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt={formData.name} className="w-20 h-20 rounded-full" />
                                        ) : (
                                            initials
                                        )}
                                    </div>
                                    <div>
                                        <Button variant="outline" size="sm">Change Photo</Button>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <Button variant="outline">Cancel</Button>
                                    <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : saveSuccess ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Saved!
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Company Section */}
                    {activeSection === 'company' && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Company Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Company Name</label>
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                placeholder="Enter company name"
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Industry</label>
                                            <select
                                                value={formData.industry}
                                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                <option>SaaS / Technology</option>
                                                <option>E-commerce</option>
                                                <option>Fintech</option>
                                                <option>Healthcare</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Currency</label>
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                <option>USD</option>
                                                <option>EUR</option>
                                                <option>GBP</option>
                                                <option>INR</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">Fiscal Year Start</label>
                                            <select
                                                value={formData.fiscalYearStart}
                                                onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            >
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                                                    <option key={month}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <Button variant="outline">Cancel</Button>
                                        <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">Connected Banks</CardTitle>
                                    <PlaidLinkDemoButton
                                        onSuccess={() => mutate()}
                                        variant="gradient"
                                        size="sm"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Bank
                                    </PlaidLinkDemoButton>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {accounts.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground mb-4">No bank accounts connected</p>
                                            <PlaidLinkDemoButton onSuccess={() => mutate()} variant="outline">
                                                Connect Your First Bank
                                            </PlaidLinkDemoButton>
                                        </div>
                                    ) : (
                                        accounts.map((account: any) => (
                                            <div key={account.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{account.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatCurrency(account.balance)} • Last synced: Just now
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        <Check className="w-3 h-3" />
                                                        Connected
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                        onClick={() => handleDisconnectBank(account.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Alert Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                                        Runway Warning Threshold (months)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.runwayAlert}
                                        onChange={(e) => setFormData({ ...formData, runwayAlert: e.target.value })}
                                        className="w-full md:w-48 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Get alerted when runway falls below this threshold</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1.5">
                                        Spending Spike Alert (% increase)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.spendingAlert}
                                        onChange={(e) => setFormData({ ...formData, spendingAlert: e.target.value })}
                                        className="w-full md:w-48 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Get alerted when any category increases by this %</p>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="font-medium text-slate-900 dark:text-white">Notification Channels</h4>
                                    {[
                                        { label: 'Email notifications', description: 'Receive alerts via email', enabled: true },
                                        { label: 'Weekly digest', description: 'Summary every Monday', enabled: true },
                                        { label: 'Push notifications', description: 'Browser push alerts', enabled: false },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <div className={cn(
                                                "w-11 h-6 rounded-full relative cursor-pointer transition-colors",
                                                item.enabled ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                                            )}>
                                                <span className={cn(
                                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                                                    item.enabled ? "translate-x-5" : "translate-x-0.5"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <Button variant="outline">Cancel</Button>
                                    <Button variant="gradient" onClick={handleSave}>Save Changes</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Team Section */}
                    {activeSection === 'team' && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Team Members</CardTitle>
                                <Button variant="gradient" size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Invite Member
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Current User */}
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                                                {initials}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{formData.name || 'You'}</p>
                                                <p className="text-sm text-muted-foreground">{formData.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 text-sm rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                Owner
                                            </span>
                                        </div>
                                    </div>

                                    {/* Placeholder for additional team members */}
                                    <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                        <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">Invite team members to collaborate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Section */}
                    {activeSection === 'billing' && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Current Plan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                        <div>
                                            <p className="text-lg font-bold">Growth Plan</p>
                                            <p className="opacity-80">$299/month • Billed monthly</p>
                                        </div>
                                        <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                            Upgrade Plan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                                                <p className="text-sm text-muted-foreground">Expires 12/25</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Update</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Security Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Change Password</p>
                                        <p className="text-sm text-muted-foreground">Update your password regularly</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                        Not enabled
                                    </span>
                                </button>
                                <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Active Sessions</p>
                                        <p className="text-sm text-muted-foreground">Manage your logged-in devices</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Appearance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Light', 'Dark', 'System'].map((theme) => (
                                            <button
                                                key={theme}
                                                className={cn(
                                                    "p-4 rounded-lg border-2 transition-all text-center",
                                                    theme === 'System'
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                                )}
                                            >
                                                <Palette className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{theme}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Data Export Section */}
                    {activeSection === 'export' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Export Data</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { label: 'Transactions', description: 'Export all transactions as CSV' },
                                    { label: 'Financial Reports', description: 'Download PDF reports' },
                                    { label: 'Full Data Export', description: 'Export all your data (JSON)' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
