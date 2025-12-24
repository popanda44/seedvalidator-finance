"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const AIChatPreview = () => {
    const [messages, setMessages] = useState([
        { role: "user", content: "What's my current burn rate?" },
        { role: "assistant", content: "Based on recent transactions, your average burn rate is $45,200." },
        { role: "user", content: "How does that affect runway?" },
        { role: "assistant", content: "With your cash balance of $520k, you have approximately 11.5 months of runway left. I suggest reviewing the AWS spend surge." }
    ]);

    return (
        <div className="flex flex-col h-full w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative group">
            {/* Header */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <div className="text-sm font-medium text-white">SeedValidator AI</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 space-y-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/20 z-10 pointer-events-none" />

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: idx * 1.5 + 0.5, duration: 0.4 }}
                        className={cn(
                            "flex gap-3 max-w-[90%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === "user" ? "bg-slate-700" : "bg-indigo-600/20"
                        )}>
                            {msg.role === "user" ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div className={cn(
                            "p-3 rounded-2xl text-sm leading-relaxed",
                            msg.role === "user"
                                ? "bg-slate-800 text-slate-200 rounded-tr-sm"
                                : "bg-indigo-900/20 text-indigo-100 border border-indigo-500/20 rounded-tl-sm backdrop-blur-sm"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {/* Typing Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 6 }}
                    className="flex gap-1 ml-11"
                >
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                </motion.div>
            </div>

            {/* Input Placeholder */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
                <div className="h-10 bg-slate-800 rounded-lg border border-slate-700 flex items-center px-3 gap-2 opacity-50">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-slate-500">Ask financial insights...</span>
                </div>
            </div>
        </div>
    );
};
