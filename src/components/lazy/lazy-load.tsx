'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface LazyLoadProps {
  children: ReactNode
  threshold?: number
  rootMargin?: string
  placeholder?: ReactNode
  className?: string
}

/**
 * LazyLoad component that only renders children when visible in viewport
 * Uses IntersectionObserver for efficient visibility detection
 */
export function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '100px',
  placeholder,
  className,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : placeholder}
    </div>
  )
}

/**
 * Hook for detecting when an element is visible in viewport
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
      if (entry.isIntersecting) {
        setHasBeenInView(true)
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return { ref, isInView, hasBeenInView }
}

/**
 * Hook for staggered animations on scroll
 */
export function useStaggerAnimation(itemCount: number, staggerDelay: number = 100) {
  const { ref, isInView } = useInView({ threshold: 0.1 })
  const [animatedItems, setAnimatedItems] = useState<boolean[]>(new Array(itemCount).fill(false))

  useEffect(() => {
    if (isInView) {
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setAnimatedItems((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, i * staggerDelay)
      }
    }
  }, [isInView, itemCount, staggerDelay])

  return { ref, animatedItems }
}
