"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
    heading?: string;
    subheading?: string;
}

export const AuthSplitLayout = ({
    children,
    heading = "Welcome back",
    subheading = "Enter your details to access your account",
}: AuthLayoutProps) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-white">

            {/* AMBIENT BACKDROP - High-End Mesh Gradient */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -70, 0],
                        y: [0, 40, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"
                />
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[440px] px-6 py-12 flex flex-col items-center">

                {/* BACK LINK */}
                <Link
                    href="/"
                    className="group mb-12 flex items-center gap-2 text-zinc-500 hover:text-white transition-all duration-300"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 group-hover:border-zinc-700">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium tracking-tight">Return Home</span>
                </Link>

                {/* FORM CARD */}
                <div className="w-full space-y-10">

                    {/* BRAND & HEADER */}
                    <div className="text-center space-y-3">
                        <Link href="/" className="inline-block mb-6">
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20">
                                <div className="h-4 w-4 bg-zinc-950 rounded-full" />
                            </div>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-white">{heading}</h1>
                        <p className="text-zinc-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                            {subheading}
                        </p>
                    </div>

                    {/* FORM COMPONENT */}
                    <div className="w-full bg-zinc-900/40 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-3xl shadow-black/50">
                        {children}
                    </div>

                    {/* SECURITY FOOTER */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-emerald-500/80 tracking-widest uppercase">Verified Secure</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 text-center tracking-tight">
                            SeedValidator uses 256-bit encryption for all data transmissions.
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};
