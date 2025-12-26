"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
    Link2,
    ExternalLink,
    Check,
    X,
    Loader2,
    RefreshCw,
    Building2,
    CreditCard,
    BarChart3,
    Mail,
    MessageSquare,
    Zap,
    AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    status: "connected" | "disconnected" | "error";
    category: string;
    configKey?: string;
}

const integrations: Integration[] = [
    {
        id: "plaid",
        name: "Plaid",
        description: "Connect bank accounts for automatic transaction syncing",
        icon: Building2,
        status: "disconnected",
        category: "Banking",
        configKey: "PLAID_CLIENT_ID",
    },
    {
        id: "hubspot",
        name: "HubSpot",
        description: "Sync deals and revenue data from your CRM",
        icon: BarChart3,
        status: "disconnected",
        category: "CRM",
        configKey: "HUBSPOT_CLIENT_ID",
    },
    {
        id: "stripe",
        name: "Stripe",
        description: "Import payment and subscription data",
        icon: CreditCard,
        status: "disconnected",
        category: "Payments",
        configKey: "STRIPE_SECRET_KEY",
    },
    {
        id: "resend",
        name: "Resend",
        description: "Send email notifications and alerts",
        icon: Mail,
        status: "disconnected",
        category: "Notifications",
        configKey: "RESEND_API_KEY",
    },
    {
        id: "slack",
        name: "Slack",
        description: "Get real-time alerts in your Slack workspace",
        icon: MessageSquare,
        status: "disconnected",
        category: "Notifications",
        configKey: "SLACK_WEBHOOK_URL",
    },
    {
        id: "openai",
        name: "OpenAI",
        description: "AI-powered financial insights and recommendations",
        icon: Zap,
        status: "disconnected",
        category: "AI",
        configKey: "OPENAI_API_KEY",
    },
];

export default function IntegrationsPage() {
    const [connecting, setConnecting] = useState<string | null>(null);

    // Fetch notification/integration status
    const { data: notificationStatus } = useSWR("/api/notifications", fetcher);
    const { data: hubspotData, mutate: mutateHubspot } = useSWR("/api/integrations/hubspot", fetcher);
    const { data: aiData } = useSWR("/api/ai/insights", fetcher);

    // Determine status based on API responses
    const getStatus = (id: string): "connected" | "disconnected" | "error" => {
        if (id === "resend" && notificationStatus?.email?.configured) return "connected";
        if (id === "slack" && notificationStatus?.slack?.configured) return "connected";
        if (id === "hubspot" && hubspotData?.connected) return "connected";
        if (id === "openai" && aiData && !aiData.isDemo) return "connected";
        return "disconnected";
    };

    const handleConnect = async (integration: Integration) => {
        setConnecting(integration.id);

        try {
            if (integration.id === "hubspot") {
                // Get HubSpot auth URL
                const response = await fetch("/api/integrations/hubspot?action=auth-url");
                const data = await response.json();

                if (data.authUrl) {
                    window.open(data.authUrl, "_blank", "width=600,height=700");
                } else if (data.error) {
                    alert(`HubSpot not configured: ${data.message}`);
                }
            } else if (integration.id === "plaid") {
                // Plaid is handled via PlaidLink component
                alert("Use the 'Connect Bank' button in settings to link a bank account");
            } else {
                // For other integrations, show configuration instructions
                alert(`To enable ${integration.name}, add ${integration.configKey} to your environment variables in Vercel.`);
            }
        } catch (error) {
            console.error("Connect error:", error);
        } finally {
            setConnecting(null);
        }
    };

    const handleDisconnect = async (integration: Integration) => {
        // Environment variable-based integrations can't be disconnected from UI
        if (["openai", "plaid", "stripe", "resend", "slack"].includes(integration.id)) {
            alert(`${integration.name} is configured via environment variables. To disconnect, remove ${integration.configKey} from your Vercel environment settings.`);
            return;
        }

        if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) return;

        setConnecting(integration.id);
        try {
            if (integration.id === "hubspot") {
                await fetch("/api/integrations/hubspot", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "disconnect" }),
                });
                mutateHubspot();
            }
        } catch (error) {
            console.error("Disconnect error:", error);
        } finally {
            setConnecting(null);
        }
    };

    const groupedIntegrations = integrations.reduce((acc, integration) => {
        if (!acc[integration.category]) acc[integration.category] = [];
        acc[integration.category].push(integration);
        return acc;
    }, {} as Record<string, Integration[]>);

    return (
        <div className="min-h-screen bg-background p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Link2 className="h-8 w-8" />
                        Integrations
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Connect your tools to automate financial data syncing
                    </p>
                </div>

                {/* Status Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-emerald-500" />
                            <span className="font-medium text-foreground">Connected</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-500 mt-1">
                            {integrations.filter((i) => getStatus(i.id) === "connected").length}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary border border-border">
                        <div className="flex items-center gap-2">
                            <X className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium text-foreground">Available</span>
                        </div>
                        <p className="text-2xl font-bold text-muted-foreground mt-1">
                            {integrations.filter((i) => getStatus(i.id) === "disconnected").length}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <span className="font-medium text-foreground">Errors</span>
                        </div>
                        <p className="text-2xl font-bold text-red-500 mt-1">
                            {integrations.filter((i) => getStatus(i.id) === "error").length}
                        </p>
                    </div>
                </div>

                {/* Integration Categories */}
                {Object.entries(groupedIntegrations).map(([category, items]) => (
                    <div key={category} className="space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">{category}</h2>
                        <div className="grid gap-4">
                            {items.map((integration) => {
                                const status = getStatus(integration.id);
                                const isConnecting = connecting === integration.id;

                                return (
                                    <motion.div
                                        key={integration.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-xl bg-card border border-border flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${status === "connected"
                                                ? "bg-emerald-500/10"
                                                : "bg-secondary"
                                                }`}>
                                                <integration.icon className={`h-6 w-6 ${status === "connected"
                                                    ? "text-emerald-500"
                                                    : "text-muted-foreground"
                                                    }`} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-foreground flex items-center gap-2">
                                                    {integration.name}
                                                    {status === "connected" && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-500 rounded">
                                                            Connected
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {integration.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {status === "connected" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDisconnect(integration)}
                                                        disabled={isConnecting}
                                                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Disconnect
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                                        title="Configure"
                                                    >
                                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleConnect(integration)}
                                                    disabled={isConnecting}
                                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isConnecting ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Link2 className="h-4 w-4" />
                                                    )}
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* HubSpot Data Preview */}
                {hubspotData?.data && (
                    <div className="p-6 rounded-xl bg-card border border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            HubSpot Pipeline {hubspotData.demo && <span className="text-xs text-muted-foreground">(Demo Data)</span>}
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg bg-secondary/50">
                                <p className="text-sm text-muted-foreground">Total Deals</p>
                                <p className="text-xl font-bold text-foreground">{hubspotData.data.totalDeals}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                                <p className="text-xl font-bold text-foreground">
                                    ${(hubspotData.data.totalValue / 1000000).toFixed(1)}M
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                                <p className="text-sm text-muted-foreground">Won Deals</p>
                                <p className="text-xl font-bold text-emerald-500">{hubspotData.data.wonDeals}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                                <p className="text-sm text-muted-foreground">Won Value</p>
                                <p className="text-xl font-bold text-emerald-500">
                                    ${(hubspotData.data.wonValue / 1000000).toFixed(1)}M
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
