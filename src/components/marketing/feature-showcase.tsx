"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Zap, MessageSquare, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        id: "cashflow",
        title: "Real-time Cash Flow",
        description: "Stop waiting for month-end reports. Get a live pulse on your burn rate, runway, and cash position instantly via Plaid integration.",
        icon: Zap,
        image: "linear-gradient(to bottom right, #4f46e5, #818cf8)", // Placeholder for actual screenshot/component
        component: (
            <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]" />
                <div className="relative z-10 p-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Sync Active
                    </div>
                    <h3 className="text-4xl font-bold text-white tracking-tight">$2,845,000</h3>
                    <p className="text-zinc-400">Total Available Cash</p>
                    <div className="h-32 w-64 mx-auto mt-8 flex items-end justify-center gap-2">
                        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-8 bg-indigo-500 rounded-t-sm opacity-80" />
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "forecasting",
        title: "Intelligent Forecasting",
        description: "Simulate hiring plans, marketing spend, and product launches. See exactly how decisions impact your runway in real-time.",
        icon: BarChart3,
        component: (
            <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative flex items-center justify-center p-8">
                <div className="w-full max-w-sm space-y-6">
                    <div className="flex justify-between text-sm text-zinc-400">
                        <span>Engineering Hires</span>
                        <span>+3 FTE</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%]" />
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400">
                        <span>Marketing Budget</span>
                        <span>$50k/mo</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[40%]" />
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 mt-8">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">New Runway</div>
                        <div className="text-2xl font-bold text-white">18 Months</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "ai",
        title: "AI Financial Analyst",
        description: "Ask complex questions like 'Why did burn increase last month?' and get data-backed answers with citations to specific transactions.",
        icon: MessageSquare,
        component: (
            <div className="w-full h-full bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative flex flex-col p-6">
                <div className="flex-1 space-y-4">
                    <div className="flex gap-3 justify-end">
                        <div className="bg-indigo-600/20 text-indigo-300 px-4 py-2 rounded-2xl rounded-tr-sm text-sm border border-indigo-500/20">
                            Why is our burn rate up 15%?
                        </div>
                    </div>
                    <div className="flex gap-3 justify-start">
                        <div className="bg-zinc-800 text-zinc-300 px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-white/5 shadow-xl">
                            <p>Driven by a <strong>$12k increase in cloud costs</strong> (AWS) and the new <strong>Q3 marketing retainer</strong>.</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-xs bg-black/30 px-2 py-1 rounded border border-white/10">AWS-PROD-2</span>
                                <span className="text-xs bg-black/30 px-2 py-1 rounded border border-white/10">AGENCY-FEE</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                    <div className="h-8 w-full bg-zinc-950 rounded border border-white/5 animate-pulse" />
                    <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
        )
    }
];

export function FeatureShowcase() {
    const [activeFeature, setActiveFeature] = useState(0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Tabs */}
            <div className="lg:col-span-5 space-y-2">
                {features.map((feature, index) => (
                    <button
                        key={feature.id}
                        onClick={() => setActiveFeature(index)}
                        className={cn(
                            "w-full text-left p-6 rounded-2xl transition-all duration-300 group border border-transparent",
                            activeFeature === index
                                ? "bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-white/10 shadow-lg"
                                : "hover:bg-zinc-50 dark:hover:bg-white/5"
                        )}
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                activeFeature === index
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                            )}>
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className={cn(
                                "text-xl font-bold transition-colors",
                                activeFeature === index ? "text-zinc-900 dark:text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                            )}>
                                {feature.title}
                            </h3>
                        </div>
                        <p className={cn(
                            "pl-[3.25rem] text-sm leading-relaxed transition-colors",
                            activeFeature === index ? "text-zinc-600 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"
                        )}>
                            {feature.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-7 h-[500px] relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative h-full w-full bg-zinc-950 rounded-3xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFeature}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="w-full h-full p-2"
                        >
                            {features[activeFeature].component}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
