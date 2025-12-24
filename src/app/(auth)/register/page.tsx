"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    ArrowRight,
    Building2,
    CheckCircle2,
    Github,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

const features = [
    "Real-time cash flow tracking",
    "12+ month runway forecasting",
    "Investor-ready reports",
];

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<"form" | "success">("form");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        companyName: "",
    });
    const [formError, setFormError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFormError("");

        // Validate password
        if (formData.password.length < 8) {
            setFormError("Password must be at least 8 characters");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setFormError(data.error || "Registration failed");
                setIsLoading(false);
                return;
            }

            // Auto sign in after registration
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setStep("success");
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
        } catch {
            setFormError("An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    const handleOAuthSignIn = (provider: string) => {
        setIsLoading(true);
        signIn(provider, { callbackUrl: "/dashboard" });
    };

    if (step === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 text-center animate-fade-in shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Account Created!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Your account has been created successfully.
                    </p>
                    <Link href="/login">
                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                            Sign in to your account
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <AuthSplitLayout
            heading="Start your free trial"
            subheading="No credit card required • 14-day free trial"
        >
            <div className="space-y-6 animate-fade-in">
                {/* Error Display */}
                {formError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-sm">{formError}</span>
                    </div>
                )}

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleOAuthSignIn("google")}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-input hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                        <span className="text-sm font-medium">Google</span>
                    </button>

                    <button
                        onClick={() => handleOAuthSignIn("github")}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-input hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
                    >
                        <Github className="w-5 h-5" />
                        <span className="text-sm font-medium">GitHub</span>
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or register with email
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-secondary/30 border border-input rounded-xl px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Company
                            </label>
                            <div className="relative group">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, companyName: e.target.value })
                                    }
                                    placeholder="Acme Inc."
                                    required
                                    className="w-full bg-secondary/30 border border-input rounded-xl px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                placeholder="name@company.com"
                                required
                                className="w-full bg-secondary/30 border border-input rounded-xl px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <span className="text-xs text-muted-foreground">
                                Min. 8 chars
                            </span>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="w-full bg-secondary/30 border border-input rounded-xl px-10 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 rounded-xl text-base font-medium shadow-sm transition-all hover:scale-[1.01]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create free account
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        What&apos;s included:
                    </p>
                    <ul className="space-y-2">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-foreground hover:underline underline-offset-4"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthSplitLayout>
    );
}
