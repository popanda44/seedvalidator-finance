"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BackgroundBeams } from "@/components/ui/background-beams";

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
        <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
            {/* Ambient Background */}
            <BackgroundBeams className="opacity-20" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none" />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Back Link */}
                <Link
                    href="/"
                    className="absolute -top-16 left-4 lg:left-0 text-sm text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                {/* Glass Card */}
                <div className="w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-8 sm:p-10 space-y-8">
                        {/* Brand Header */}
                        <div className="text-center space-y-2">
                            <Link href="/" className="inline-flex items-center gap-2 group mb-6">
                                <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/10">
                                    <div className="h-3 w-3 bg-black rounded-full" />
                                </div>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight text-white">{heading}</h1>
                            <p className="text-sm text-zinc-400">{subheading}</p>
                        </div>

                        {/* Form Content */}
                        <div className="space-y-6">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Footer Footer */}
                <p className="mt-8 text-center text-xs text-zinc-600">
                    Protected by SeedValidator Financial Security
                </p>
            </div>
        </div>
    );
};
