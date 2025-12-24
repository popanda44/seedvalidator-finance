"use client";

import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";

export const AuthSplitLayout = ({
    children,
    title,
    subtitle
}: {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}) => {
    return (
        <div className="min-h-screen w-full flex bg-slate-950">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 bg-slate-950 z-0">
                    <BackgroundBeams />
                </div>

                {/* Logo Area */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">SeedValidator</span>
                    </Link>
                </div>

                {/* Animated Data Visual (Abstract) */}
                <div className="relative z-10 flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        {/* Glowing Orb */}
                        <div className="w-64 h-64 rounded-full bg-indigo-500/20 blur-[60px]" />
                        <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow" />
                        <div className="absolute inset-4 border border-white/5 rounded-full animate-reverse-spin" />

                        {/* Floating Cards */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-12 top-0 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                        >
                            <div className="text-xs text-slate-400 mb-1">Current Runway</div>
                            <div className="text-lg font-bold text-emerald-400">18.4 Months</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [10, -10, 10] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -left-12 bottom-0 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl"
                        >
                            <div className="text-xs text-slate-400 mb-1">Burn Rate</div>
                            <div className="text-lg font-bold text-indigo-400">$42.5k / mo</div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 w-full max-w-md">
                    <blockquote className="text-lg text-slate-300 font-medium leading-relaxed">
                        "The financial clarity we gained was immediate. It's not just software; it's a competitive advantage."
                    </blockquote>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20" />
                        <div>
                            <div className="text-sm font-semibold text-white">Alex Riviera</div>
                            <div className="text-xs text-slate-500">Founder, Orbital AI</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Back Link */}
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link href="/" className="flex items-center text-sm text-slate-400 hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};
