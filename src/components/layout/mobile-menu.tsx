'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggleCompact } from '@/components/ui/theme-toggle'

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    { href: '#features', label: 'Product' },
    { href: '/pricing', label: 'Pricing' },
    { href: '#security', label: 'Security' },
    { href: '/contact', label: 'Contact' },
]

const menuVariants = {
    closed: {
        x: '100%',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
        },
    },
    open: {
        x: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
        },
    },
}

const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
}

const itemVariants = {
    closed: { opacity: 0, x: 50 },
    open: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: 0.1 + i * 0.08,
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
        },
    }),
}

function MobileMenuPanel({ isOpen, onClose }: MobileMenuProps) {
    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleEscape)
        }
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        variants={overlayVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Slide-in Panel */}
                    <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className={cn(
                            'fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-[400px]',
                            'bg-white dark:bg-zinc-900',
                            'shadow-2xl',
                            'flex flex-col'
                        )}
                    >
                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <Link href="/" onClick={onClose} className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-sm">
                                    <Image
                                        src="/logo.png"
                                        alt="FinYeld AI"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="font-bold text-xl text-foreground tracking-tight">FinYeld AI</span>
                            </Link>

                            <div className="flex items-center gap-2">
                                {/* Theme Toggle */}
                                <ThemeToggleCompact />

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className={cn(
                                        'p-2.5 rounded-xl',
                                        'bg-zinc-100 dark:bg-zinc-800',
                                        'text-zinc-600 dark:text-zinc-300',
                                        'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                                        'transition-colors duration-200'
                                    )}
                                    aria-label="Close menu"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 px-6 py-8">
                            <ul className="space-y-2">
                                {menuItems.map((item, i) => (
                                    <motion.li
                                        key={item.href}
                                        custom={i}
                                        variants={itemVariants}
                                        initial="closed"
                                        animate="open"
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                'block py-4 px-5 rounded-xl',
                                                'text-lg font-medium text-foreground',
                                                'bg-zinc-50 dark:bg-zinc-800/50',
                                                'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                                                'hover:text-emerald-600 dark:hover:text-emerald-400',
                                                'border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800',
                                                'transition-all duration-200',
                                                'flex items-center justify-between group'
                                            )}
                                        >
                                            {item.label}
                                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>

                        {/* Auth Buttons */}
                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3 safe-bottom">
                            <motion.div
                                custom={menuItems.length}
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                            >
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className={cn(
                                        'block w-full py-3.5 px-5 rounded-xl text-center',
                                        'font-medium text-foreground',
                                        'bg-zinc-100 dark:bg-zinc-800',
                                        'hover:bg-zinc-200 dark:hover:bg-zinc-700',
                                        'transition-colors duration-200'
                                    )}
                                >
                                    Sign In
                                </Link>
                            </motion.div>
                            <motion.div
                                custom={menuItems.length + 1}
                                variants={itemVariants}
                                initial="closed"
                                animate="open"
                            >
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className={cn(
                                        'block w-full py-3.5 px-5 rounded-xl text-center',
                                        'font-semibold text-white',
                                        'bg-foreground hover:bg-foreground/90',
                                        'shadow-lg shadow-emerald-500/20',
                                        'transition-all duration-200',
                                        'flex items-center justify-center gap-2'
                                    )}
                                >
                                    Start Free Trial
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// ==========================================
// HAMBURGER ICON - Animated 3-line to X
// ==========================================
interface HamburgerIconProps {
    isOpen: boolean
    onClick: () => void
    className?: string
}

export function HamburgerIcon({ isOpen, onClick, className }: HamburgerIconProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'relative p-2.5 rounded-xl',
                'bg-white/80 dark:bg-zinc-900/80',
                'backdrop-blur-md',
                'border border-zinc-200/50 dark:border-zinc-800/50',
                'shadow-sm hover:shadow-md',
                'transition-all duration-200',
                'md:hidden', // Only show on mobile
                className
            )}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
        >
            <div className="relative w-5 h-5 flex flex-col justify-center items-center">
                <motion.span
                    className="absolute h-0.5 w-5 bg-foreground rounded-full"
                    animate={{
                        rotate: isOpen ? 45 : 0,
                        y: isOpen ? 0 : -6,
                    }}
                    transition={{ duration: 0.2 }}
                />
                <motion.span
                    className="absolute h-0.5 w-5 bg-foreground rounded-full"
                    animate={{
                        opacity: isOpen ? 0 : 1,
                        scaleX: isOpen ? 0 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                />
                <motion.span
                    className="absolute h-0.5 w-5 bg-foreground rounded-full"
                    animate={{
                        rotate: isOpen ? -45 : 0,
                        y: isOpen ? 0 : 6,
                    }}
                    transition={{ duration: 0.2 }}
                />
            </div>
        </button>
    )
}

// ==========================================
// MOBILE MENU HOOK & PROVIDER
// ==========================================
export function useMobileMenu() {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

    return { isOpen, open, close, toggle }
}

export { MobileMenuPanel }
