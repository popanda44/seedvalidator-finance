"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
        <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden text-zinc-900">
            {/* Subtle Enterprise Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute inset-0 bg-white/90 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"></div>

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Back Link */}
                <Link
                    href="/"
                    className="absolute -top-16 left-4 lg:left-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>

                {/* Clean Enterprise Card */}
                <div className="w-full bg-white ring-1 ring-zinc-200 shadow-xl shadow-zinc-200/50 rounded-2xl overflow-hidden">
                    <div className="p-8 sm:p-10 space-y-8">
                        {/* Clean Header */}
                        <div className="text-center space-y-3">
                            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                                <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                                    <div className="h-3 w-3 bg-white rounded-full" />
                                </div>
                            </Link>
                            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{heading}</h1>
                            <p className="text-sm text-zinc-500">{subheading}</p>
                        </div>

                        {/* Form Content */}
                        <div className="space-y-6 text-left">
                            {children}
                        </div>
                    </div>
                    {/* Security Badge */}
                    <div className="bg-zinc-50 px-8 py-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-xs text-zinc-500 font-medium">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Bank-Grade Security (AES-256)
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs text-zinc-400">
                    © 2025 SeedValidator Finance Inc.
                </p>
            </div>
        </div>
    );
};
