"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthSplitLayoutProps {
    children: React.ReactNode;
    heading?: string;
    subheading?: string;
}

export const AuthSplitLayout = ({
    children,
    heading = "Welcome back",
    subheading = "Enter your details to access your account",
}: AuthSplitLayoutProps) => {
    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left Column - Visuals (Abstract/Minimalist) */}
            <div className="hidden lg:flex lg:w-[40%] relative bg-zinc-900 border-r border-white/5 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-stone-950" />

                {/* Abstract animated geometric pattern */}
                <div className="relative w-full h-full max-w-lg max-h-lg flex items-center justify-center perspective-1000">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute border border-white/10 rounded-full"
                            style={{
                                width: `${30 + i * 15}rem`,
                                height: `${30 + i * 15}rem`,
                            }}
                            animate={{
                                rotate: i % 2 === 0 ? 360 : -360,
                                scale: [1, 1.02, 1],
                            }}
                            transition={{
                                rotate: { duration: 40 + i * 10, ease: "linear", repeat: Infinity },
                                scale: { duration: 5 + i, ease: "easeInOut", repeat: Infinity },
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Central Hub */}
                    <div className="relative z-10 text-center space-y-4 p-8 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 max-w-sm">
                        <div className="h-10 w-10 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-white/20">
                            <div className="h-3 w-3 bg-black rounded-full" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Financial Intelligence</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            &quot;Real-time modeling for the modern CFO. Reduce burn, extend runway, and predict the future.&quot;
                        </p>
                    </div>
                </div>

                {/* Brand */}
                <div className="absolute top-8 left-8 z-20">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-black rounded-full" />
                        </div>
                        <span className="text-white font-bold tracking-tight">SeedValidator</span>
                    </Link>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-[60%] flex items-center justify-center p-8 bg-background relative">
                <Link
                    href="/"
                    className="absolute top-8 left-8 lg:hidden text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="w-full max-w-lg space-y-10 px-4 sm:px-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">{heading}</h1>
                        <p className="text-muted-foreground text-lg">{subheading}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};
