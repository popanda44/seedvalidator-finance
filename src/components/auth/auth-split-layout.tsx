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
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans selection:bg-primary/20 selection:text-primary-foreground">

            {/* AMBIENT BACKDROP */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.15),transparent_70%)]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 mix-blend-overlay pointer-events-none" />

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full mix-blend-screen"
                />
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="relative z-10 w-full max-w-[420px] px-6 py-12 flex flex-col items-center">

                {/* BACK LINK */}
                <Link
                    href="/"
                    className="group mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/50 group-hover:border-primary/50 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium tracking-tight">Return Home</span>
                </Link>

                {/* FORM CARD */}
                <div className="w-full space-y-8">

                    {/* BRAND & HEADER */}
                    <div className="text-center space-y-2">
                        <div className="h-12 w-12 bg-foreground rounded-xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                            <div className="h-3 w-3 bg-background rounded-full" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>
                        <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                            {subheading}
                        </p>
                    </div>

                    {/* FORM COMPONENT */}
                    <div className="w-full bg-card/40 backdrop-blur-xl border border-border p-6 sm:p-8 rounded-3xl shadow-2xl">
                        {children}
                    </div>

                    {/* SECURITY FOOTER */}
                    <div className="flex flex-col items-center gap-3 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-medium text-emerald-500 tracking-wide uppercase">Secured by Encryption</span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
