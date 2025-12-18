import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Authentication | SeedValidator Finance',
    description: 'Sign in to your SeedValidator Finance account',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-white">SeedValidator</span>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            Know your runway.<br />
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Plan with confidence.
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md">
                            The AI-powered FP&A platform that gives you real-time financial visibility,
                            automated forecasting, and investor-ready reports.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 pt-8">
                            <div>
                                <div className="text-3xl font-bold text-white">500+</div>
                                <div className="text-sm text-slate-400">Companies</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">$2B+</div>
                                <div className="text-sm text-slate-400">Cash Managed</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">4.9/5</div>
                                <div className="text-sm text-slate-400">Rating</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <p className="text-slate-200 italic mb-4">
                            &ldquo;SeedValidator saved us from running out of cash. The runway alerts gave us
                            the 3-month head start we needed to close our Series A.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                                SK
                            </div>
                            <div>
                                <div className="font-medium text-white">Sarah Kim</div>
                                <div className="text-sm text-slate-400">CEO, TechStartup Inc.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Auth form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    )
}
