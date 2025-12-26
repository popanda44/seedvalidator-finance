'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative w-9 h-9">
        <div className="w-5 h-5 bg-muted animate-pulse rounded-full" />
      </Button>
    )
  }

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Bright mode',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Easy on the eyes',
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Match OS setting',
    },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className={cn(
          'relative w-9 h-9 overflow-hidden group',
          'hover:bg-primary/10 transition-all duration-300',
          open && 'bg-primary/10'
        )}
        aria-label="Toggle theme"
      >
        {/* Animated icon container */}
        <div className="relative w-5 h-5">
          {/* Sun icon - visible in light mode */}
          <Sun
            className={cn(
              'absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out',
              'text-amber-500',
              resolvedTheme === 'dark'
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            )}
          />
          {/* Moon icon - visible in dark mode */}
          <Moon
            className={cn(
              'absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out',
              'text-blue-400',
              resolvedTheme === 'dark'
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            )}
          />
        </div>

        {/* Glow effect on hover */}
        <div
          className={cn(
            'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity',
            resolvedTheme === 'dark' ? 'bg-blue-400' : 'bg-amber-400'
          )}
        />
      </Button>

      {/* Dropdown menu */}
      {open && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-50',
            'bg-card border border-border shadow-xl',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
            'duration-200'
          )}
        >
          <div className="p-1.5">
            {themes.map((t) => {
              const Icon = t.icon
              const isActive = theme === t.value

              return (
                <button
                  key={t.value}
                  onClick={() => {
                    setTheme(t.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'text-sm transition-all duration-200',
                    'hover:bg-primary/10',
                    isActive && 'bg-primary/15 text-primary'
                  )}
                >
                  <div
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive ? 'bg-primary/20' : 'bg-muted'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isActive && t.value === 'light' && 'text-amber-500',
                        isActive && t.value === 'dark' && 'text-blue-400',
                        isActive && t.value === 'system' && 'text-primary'
                      )}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.description}</span>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Current theme indicator */}
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Currently: <span className="font-medium text-foreground">{resolvedTheme}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for mobile
export function ThemeToggleCompact() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9"
    >
      <Sun
        className={cn(
          'w-5 h-5 transition-all',
          resolvedTheme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        )}
      />
      <Moon
        className={cn(
          'absolute w-5 h-5 transition-all',
          resolvedTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
