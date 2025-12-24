"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle, ArrowRight, Mail, Lock, Eye, EyeOff, Github } from "lucide-react";

import { cn } from "@/lib/utils";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const error = searchParams.get("error");

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [formError, setFormError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setFormError("Invalid email or password");
                setIsLoading(false);
                return;
            }

            router.push(callbackUrl);
        } catch {
            setFormError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = (provider: string) => {
        setIsLoading(true);
        signIn(provider, { callbackUrl });
    };

    return (
        <AuthSplitLayout
            heading="Welcome back"
            subheading="Enter your credentials to access your account"
        >
            <div className="space-y-6 animate-fade-in">
                {/* Error Display */}
                {(error || formError) && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-sm">
                            {formError ||
                                (error === "OAuthAccountNotLinked"
                                    ? "This email is already associated with another account."
                                    : "Authentication failed. Please try again.")}
                        </span>
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 group"
                    >
                        <svg className="w-4 h-4 text-zinc-400 group-hover:text-white" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-xs font-semibold tracking-wide text-zinc-400 group-hover:text-white">Google</span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("github")}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 group"
                    >
                        <Github className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        <span className="text-xs font-semibold tracking-wide text-zinc-400 group-hover:text-white">GitHub</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="ceo@startup.com"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-11 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-[11px] font-medium text-zinc-500 hover:text-white transition-colors"
                            >
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="••••••••"
                                required
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-11 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all shadow-inner"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-200 h-14 rounded-2xl text-sm font-bold shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Sign in to Account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-foreground hover:underline underline-offset-4"
                    >
                        Create one free
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <Loader2 className="w-8 h-8 animate-spin text-foreground" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
