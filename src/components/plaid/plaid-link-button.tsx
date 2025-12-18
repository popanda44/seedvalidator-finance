'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Building2,
    CheckCircle2,
    Loader2,
    AlertCircle,
    ExternalLink,
} from 'lucide-react'

interface PlaidLinkButtonProps {
    companyId: string
    userId: string
    onSuccess?: (accounts: any[]) => void
    onExit?: () => void
    variant?: 'default' | 'gradient' | 'outline'
    size?: 'default' | 'sm' | 'lg'
    className?: string
    children?: React.ReactNode
}

type LinkState = 'idle' | 'loading' | 'ready' | 'success' | 'error'

export function PlaidLinkButton({
    companyId,
    userId,
    onSuccess,
    onExit,
    variant = 'gradient',
    size = 'default',
    className,
    children,
}: PlaidLinkButtonProps) {
    const [linkToken, setLinkToken] = useState<string | null>(null)
    const [linkState, setLinkState] = useState<LinkState>('idle')
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [linkedAccounts, setLinkedAccounts] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    // Fetch link token when component mounts
    useEffect(() => {
        const fetchLinkToken = async () => {
            setLinkState('loading')
            try {
                const response = await fetch('/api/plaid/create-link-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, companyId }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create link token')
                }

                setLinkToken(data.linkToken)
                setLinkState('ready')
            } catch (err: any) {
                console.error('Link token error:', err)
                setError(err.message)
                setLinkState('error')
            }
        }

        if (companyId && userId) {
            fetchLinkToken()
        }
    }, [companyId, userId])

    // Handle successful link
    const handleOnSuccess: PlaidLinkOnSuccess = useCallback(
        async (publicToken, metadata) => {
            setLinkState('loading')
            try {
                const response = await fetch('/api/plaid/exchange-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        publicToken,
                        institutionId: metadata.institution?.institution_id,
                        companyId,
                        userId,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to exchange token')
                }

                setLinkedAccounts(data.accounts)
                setLinkState('success')
                setShowSuccessModal(true)
                onSuccess?.(data.accounts)
            } catch (err: any) {
                console.error('Token exchange error:', err)
                setError(err.message)
                setLinkState('error')
            }
        },
        [companyId, userId, onSuccess]
    )

    // Handle exit
    const handleOnExit = useCallback(() => {
        onExit?.()
    }, [onExit])

    // Plaid Link configuration
    const config: PlaidLinkOptions = {
        token: linkToken,
        onSuccess: handleOnSuccess,
        onExit: handleOnExit,
    }

    const { open, ready } = usePlaidLink(config)

    const handleClick = () => {
        if (ready && linkToken) {
            open()
        }
    }

    const isDisabled = linkState === 'loading' || !ready || !linkToken

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleClick}
                disabled={isDisabled}
            >
                {linkState === 'loading' ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    children || (
                        <>
                            <Building2 className="w-4 h-4 mr-2" />
                            Connect Bank
                        </>
                    )
                )}
            </Button>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center">
                            Bank Connected Successfully!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Your bank account has been linked. We&apos;ll sync your transactions automatically.
                        </DialogDescription>
                    </DialogHeader>

                    {linkedAccounts.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Linked Accounts:
                            </p>
                            <div className="space-y-2">
                                {linkedAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{account.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    ••••{account.mask}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-medium text-emerald-600">
                                            ${account.balance?.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <Button
                            variant="gradient"
                            className="w-full"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Error Display */}
            {linkState === 'error' && error && (
                <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => {
                                setError(null)
                                setLinkState('idle')
                            }}
                            className="text-xs text-red-500 hover:underline mt-1"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

// Simplified button for demo/development without Plaid configured
export function PlaidLinkDemoButton({
    onSuccess,
    variant = 'gradient',
    size = 'default',
    className,
    children,
}: Omit<PlaidLinkButtonProps, 'companyId' | 'userId'>) {
    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleClick = () => {
        setShowModal(true)
    }

    const handleConnect = async () => {
        setIsLoading(true)

        // Simulate connection
        await new Promise(resolve => setTimeout(resolve, 2000))

        const mockAccounts = [
            { id: '1', name: 'Chase Business Checking', mask: '4567', balance: 542000 },
            { id: '2', name: 'Chase Business Savings', mask: '8901', balance: 150000 },
        ]

        setIsLoading(false)
        setShowModal(false)
        onSuccess?.(mockAccounts)
    }

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={handleClick}
            >
                {children || (
                    <>
                        <Building2 className="w-4 h-4 mr-2" />
                        Connect Bank
                    </>
                )}
            </Button>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Connect Your Bank</DialogTitle>
                        <DialogDescription>
                            In production, this will open Plaid Link for secure bank authentication.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    This is a demo. Click below to simulate connecting a bank account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Button
                            variant="gradient"
                            className="w-full"
                            onClick={handleConnect}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                'Connect Demo Bank'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        Powered by Plaid
                    </p>
                </DialogContent>
            </Dialog>
        </>
    )
}
