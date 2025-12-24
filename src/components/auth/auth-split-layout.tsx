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
        <div className="min-h-screen w-full flex bg-white font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">

            {/* LEFT COLUMN - Visual Experience (45%) */}
            <div className="hidden lg:flex w-[45%] bg-zinc-950 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

                {/* Visual Pulse Animation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 100, ease: "linear", repeat: Infinity }}
                        className="w-[800px] h-[800px] border border-white/5 rounded-full absolute"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 70, ease: "linear", repeat: Infinity }}
                        className="w-[600px] h-[600px] border border-dashed border-white/10 rounded-full absolute"
                    />
                </div>

                {/* Top: Brand */}
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="h-8 w-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-lg">
                            SV
                        </div>
                        <span className="text-xl font-bold tracking-tight">SeedValidator</span>
                    </Link>
                </div>

                {/* Middle: Floating Data Card (Visual Candy) */}
                <div className="relative z-10 pl-8">
                    <div className="relative bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl transform rotate-3">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="text-[10px] font-mono text-zinc-500">LIVE MONITORING</div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="text-xs text-zinc-400">Current Burn Rate</div>
                                    <div className="text-2xl font-bold font-mono">$42,500<span className="text-zinc-600 text-lg">/mo</span></div>
                                </div>
                                <div className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20">+12% runway</div>
                            </div>
                            <div className="h-16 flex items-end gap-1">
                                {[40, 70, 45, 90, 65, 80, 50, 95, 75, 60].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05, duration: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                                        className="flex-1 bg-indigo-500/80 rounded-t-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Testimonial */}
                <div className="relative z-10 max-w-sm">
                    <blockquote className="text-lg font-medium leading-relaxed text-zinc-300">
                        &quot;The most precise financial modeling tool I&apos;ve used. It feels like having a CFO in your pocket.&quot;
                    </blockquote>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                        <div className="text-sm">
                            <div className="font-semibold text-white">Elena R.</div>
                            <div className="text-zinc-500">Founder, TechSpace</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Form (55%) */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 relative">
                <Link
                    href="/"
                    className="absolute top-8 left-8 text-sm font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-2 transition-colors lg:hidden"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>

                <div className="w-full max-w-[420px] space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{heading}</h1>
                        <p className="text-zinc-500">{subheading}</p>
                    </div>
                    {children}
                    <p className="px-8 text-center text-sm text-zinc-500 mt-8">
                        By clicking continue, you agree to our <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
                    </p>
                </div>
            </div>

        </div>
    );
};
