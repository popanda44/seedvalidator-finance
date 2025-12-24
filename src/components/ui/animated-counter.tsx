'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
    value: number
    prefix?: string
    suffix?: string
    duration?: number
    decimals?: number
    className?: string
    formatFn?: (value: number) => string
}

export function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
    duration = 1500,
    decimals = 0,
    className,
    formatFn,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0)
    const [hasAnimated, setHasAnimated] = useState(false)
    const elementRef = useRef<HTMLSpanElement>(null)
    const previousValueRef = useRef(0)

    // Intersection Observer for viewport visibility
    useEffect(() => {
        const element = elementRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true)
                    }
                })
            },
            { threshold: 0.1 }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [hasAnimated])

    // Animation logic
    useEffect(() => {
        if (!hasAnimated) return

        const startValue = previousValueRef.current
        const endValue = value
        const startTime = Date.now()

        // Easing function for smooth deceleration
        const easeOutExpo = (t: number): number => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
        }

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOutExpo(progress)

            const currentValue = startValue + (endValue - startValue) * easedProgress
            setDisplayValue(currentValue)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                previousValueRef.current = endValue
            }
        }

        requestAnimationFrame(animate)
    }, [value, duration, hasAnimated])

    // Format the display value
    const formattedValue = formatFn
        ? formatFn(displayValue)
        : displayValue.toFixed(decimals)

    return (
        <span ref={elementRef} className={cn("tabular-nums", className)}>
            {prefix}{formattedValue}{suffix}
        </span>
    )
}

// Currency-specific animated counter
interface AnimatedCurrencyProps {
    value: number
    currency?: string
    className?: string
    showSign?: boolean
    duration?: number
}

export function AnimatedCurrency({
    value,
    currency = '$',
    className,
    showSign = false,
    duration = 1500,
}: AnimatedCurrencyProps) {
    const formatCurrency = (val: number) => {
        const absVal = Math.abs(val)
        let formatted: string

        if (absVal >= 1000000) {
            formatted = (absVal / 1000000).toFixed(1) + 'M'
        } else if (absVal >= 1000) {
            formatted = (absVal / 1000).toFixed(absVal >= 100000 ? 0 : 1) + 'K'
        } else {
            formatted = absVal.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })
        }

        const sign = showSign && value !== 0 ? (value > 0 ? '+' : '-') : (value < 0 ? '-' : '')
        return `${sign}${currency}${formatted}`
    }

    return (
        <AnimatedCounter
            value={value}
            duration={duration}
            formatFn={formatCurrency}
            className={cn("font-bold", className)}
        />
    )
}

// Percentage animated counter
interface AnimatedPercentageProps {
    value: number
    className?: string
    showSign?: boolean
    duration?: number
}

export function AnimatedPercentage({
    value,
    className,
    showSign = true,
    duration = 1200,
}: AnimatedPercentageProps) {
    const formatPercentage = (val: number) => {
        const sign = showSign && val !== 0 ? (val > 0 ? '+' : '') : ''
        return `${sign}${val.toFixed(1)}%`
    }

    return (
        <AnimatedCounter
            value={value}
            duration={duration}
            formatFn={formatPercentage}
            className={cn("font-medium", className)}
        />
    )
}

// Months animated counter (for runway)
interface AnimatedMonthsProps {
    value: number
    className?: string
    duration?: number
}

export function AnimatedMonths({
    value,
    className,
    duration = 1200,
}: AnimatedMonthsProps) {
    return (
        <AnimatedCounter
            value={value}
            decimals={1}
            suffix=" mo"
            duration={duration}
            className={cn("font-bold", className)}
        />
    )
}
