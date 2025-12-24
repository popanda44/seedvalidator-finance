"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Sparkline } from "@/components/ui/sparkline";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const RunwaySimulator = () => {
    const [cash, setCash] = useState(500000);
    const [burn, setBurn] = useState(45000);
    const [growth, setGrowth] = useState(15);

    const runway = cash / burn;
    const projectedCash = Array.from({ length: 12 }, (_, i) => {
        const monthlyBurnWithGrowth = burn * Math.pow(1 + (growth / 100 / 12), i);
        return Math.max(0, cash - (burn * i)); // Linear burn simplified for demo
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-white/80 font-medium flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> Runway Simulator
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${runway < 6 ? 'bg-red-500/20 text-red-400' :
                            runway < 12 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        {runway.toFixed(1)} Months
                    </span>
                </div>

                {/* Main Visual */}
                <div className="h-32 mb-6">
                    <Sparkline
                        data={projectedCash}
                        width={350}
                        height={120}
                        className="w-full h-full"
                        strokeWidth={3}
                        showDot={true}
                        gradientId="runway-gradient"
                        animate={true}
                        positive={runway > 12}
                    />
                </div>

                {/* Controls */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total Cash</span>
                            <span className="text-white font-mono">{formatCurrency(cash)}</span>
                        </div>
                        <Slider
                            value={[cash]}
                            min={10000}
                            max={1000000}
                            step={5000}
                            onValueChange={(val) => setCash(val[0])}
                            className="cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Monthly Burn</span>
                            <span className="text-white font-mono">{formatCurrency(burn)}</span>
                        </div>
                        <Slider
                            value={[burn]}
                            min={1000}
                            max={100000}
                            step={1000}
                            onValueChange={(val) => setBurn(val[0])}
                            className="cursor-pointer"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                    <span>*Interactive Demo</span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors cursor-help">
                        AI Sensitivity Analysis <TrendingUp className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
