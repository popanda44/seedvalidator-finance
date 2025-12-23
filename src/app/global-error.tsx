'use client'

import * as Sentry from "@sentry/nextjs"
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <div className="text-center p-8">
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Something went wrong!
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We've been notified and are working on a fix.
                        </p>
                        <Button onClick={() => reset()} variant="gradient">
                            Try again
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
