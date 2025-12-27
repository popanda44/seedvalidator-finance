'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Creative Theme Toggle - Pill Style
 * An intuitive, animated theme switcher with smooth transitions
 */
export function CreativeThemeToggle() {
    const [mounted, setMounted] = React.useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-20 h-10 rounded-full bg-muted animate-pulse" />
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'relative w-20 h-10 rounded-full p-1 transition-all duration-500',
                'bg-gradient-to-r',
                isDark
                    ? 'from-slate-800 to-slate-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'from-sky-100 to-amber-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
                'border',
                isDark ? 'border-slate-700' : 'border-amber-200/50',
                'hover:scale-105 active:scale-95'
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sliding pill */}
            <motion.div
                layout
                className={cn(
                    'relative w-8 h-8 rounded-full flex items-center justify-center',
                    'shadow-lg',
                    isDark
                        ? 'bg-slate-700'
                        : 'bg-white'
                )}
                initial={false}
                animate={{
                    x: isDark ? 40 : 0,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
            >
                {/* Sun Icon */}
                <motion.div
                    className="absolute"
                    initial={false}
                    animate={{
                        scale: isDark ? 0 : 1,
                        rotate: isDark ? -90 : 0,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Sun className="w-5 h-5 text-amber-500" />
                </motion.div>

                {/* Moon Icon */}
                <motion.div
                    className="absolute"
                    initial={false}
                    animate={{
                        scale: isDark ? 1 : 0,
                        rotate: isDark ? 0 : 90,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <Moon className="w-5 h-5 text-blue-400" />
                </motion.div>
            </motion.div>

            {/* Stars animation in dark mode */}
            <AnimatePresence>
                {isDark && (
                    <>
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-0.5 h-0.5 bg-white rounded-full"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    scale: [0, 1, 1, 0],
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.5,
                                    repeat: Infinity,
                                }}
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${25 + (i % 2) * 30}%`,
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Sun rays in light mode */}
            <AnimatePresence>
                {!isDark && (
                    <motion.div
                        className="absolute right-6 top-1/2 -translate-y-1/2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}

/**
 * Minimal Theme Toggle - Icon only with glow
 * Clean and subtle for headers
 */
export function MinimalThemeToggle() {
    const [mounted, setMounted] = React.useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'relative w-10 h-10 rounded-xl flex items-center justify-center',
                'transition-all duration-300 overflow-hidden group',
                isDark
                    ? 'bg-slate-800/50 hover:bg-slate-700/50'
                    : 'bg-amber-50 hover:bg-amber-100',
                'border',
                isDark ? 'border-slate-700' : 'border-amber-200'
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Glow effect */}
            <div
                className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    isDark
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                        : 'bg-gradient-to-br from-amber-300/30 to-orange-300/30'
                )}
            />

            {/* Icon container with rotation */}
            <motion.div
                className="relative z-10"
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
                <motion.div
                    animate={{
                        opacity: isDark ? 0 : 1,
                        y: isDark ? -10 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-5 h-5 text-amber-500" />
                </motion.div>

                <motion.div
                    animate={{
                        opacity: isDark ? 1 : 0,
                        y: isDark ? 0 : 10,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                >
                    <Moon className="w-5 h-5 text-blue-400" />
                </motion.div>
            </motion.div>
        </button>
    )
}

/**
 * Floating Theme Toggle - For mobile/bottom position
 * Larger, more touch-friendly with clear labels
 */
export function FloatingThemeToggle() {
    const [mounted, setMounted] = React.useState(false)
    const { setTheme, resolvedTheme } = useTheme()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isDark = resolvedTheme === 'dark'

    return (
        <motion.button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                'fixed bottom-6 right-6 z-50',
                'flex items-center gap-2 px-4 py-3 rounded-full',
                'shadow-lg backdrop-blur-md',
                isDark
                    ? 'bg-slate-800/90 border border-slate-700 text-white'
                    : 'bg-white/90 border border-gray-200 text-gray-900',
                'hover:scale-105 active:scale-95 transition-transform'
            )}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                animate={{ rotate: isDark ? 0 : 180 }}
                transition={{ duration: 0.3 }}
            >
                {isDark ? (
                    <Moon className="w-5 h-5 text-blue-400" />
                ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                )}
            </motion.div>
            <span className="text-sm font-medium">
                {isDark ? 'Dark' : 'Light'}
            </span>
        </motion.button>
    )
}

export default CreativeThemeToggle
