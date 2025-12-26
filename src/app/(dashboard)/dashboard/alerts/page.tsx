'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Mail,
  Smartphone,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils'

type AlertType = 'critical' | 'warning' | 'info' | 'success'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const alertIcons = {
  critical: AlertTriangle,
  warning: Clock,
  info: Bell,
  success: CheckCircle2,
}

const alertColors = {
  critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
    icon: 'text-orange-500',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-emerald-500',
  },
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | AlertType>('all')
  const [localAlerts, setLocalAlerts] = useState<any[] | null>(null)

  const { data, error, isLoading, mutate } = useSWR(`/api/alerts?filter=${filter}`, fetcher, {
    refreshInterval: 30000,
  })

  // Use local state for optimistic updates, fall back to API data
  const alerts = localAlerts || data?.alerts || []
  const counts = data?.counts || { total: 0, unread: 0, critical: 0, success: 0 }

  const filteredAlerts = alerts.filter((a: any) => !a.isDismissed)

  const markAsRead = async (id: string) => {
    // Optimistic update
    setLocalAlerts((prev) =>
      (prev || alerts).map((a: any) => (a.id === id ? { ...a, isRead: true } : a))
    )

    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      })
      mutate()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const dismissAlert = async (id: string) => {
    // Optimistic update
    setLocalAlerts((prev) =>
      (prev || alerts).map((a: any) => (a.id === id ? { ...a, isDismissed: true } : a))
    )

    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDismissed: true }),
      })
      mutate()
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }

  const markAllAsRead = async () => {
    setLocalAlerts(alerts.map((a: any) => ({ ...a, isRead: true })))
    // In production, you'd want a bulk update endpoint
    mutate()
  }

  if (isLoading && !localAlerts) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">Failed to load alerts</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alerts</h2>
          <p className="text-sm text-muted-foreground">
            Stay informed about important financial events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Alerts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.total}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer hover:shadow-lg transition-shadow',
            filter === 'unread' && 'ring-2 ring-blue-500'
          )}
          onClick={() => setFilter('unread')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{counts.unread}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{counts.unread}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer hover:shadow-lg transition-shadow',
            filter === 'critical' && 'ring-2 ring-red-500'
          )}
          onClick={() => setFilter('critical')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-500">{counts.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer hover:shadow-lg transition-shadow',
            filter === 'success' && 'ring-2 ring-emerald-500'
          )}
          onClick={() => setFilter('success')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Good News</p>
                <p className="text-2xl font-bold text-emerald-500">{counts.success}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'unread', 'critical', 'warning', 'info', 'success'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setLocalAlerts(null) // Clear local state to refetch
            }}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition-all capitalize',
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No alerts</h3>
              <p className="text-muted-foreground">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredAlerts.map((alert: any) => {
                const Icon = alertIcons[alert.type as AlertType] || Bell
                const colors = alertColors[alert.type as AlertType] || alertColors.info

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-start gap-4 p-4 transition-colors cursor-pointer',
                      !alert.isRead && 'bg-blue-50/50 dark:bg-blue-900/10',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className={cn('p-2 rounded-lg', colors.bg)}>
                      <Icon className={cn('w-5 h-5', colors.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {alert.title}
                        </h4>
                        {!alert.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      {alert.data && (
                        <div className="flex items-center gap-4 text-sm">
                          {alert.data.amount && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-muted-foreground" />
                              {typeof alert.data.amount === 'number' && alert.data.amount > 100
                                ? formatCurrency(alert.data.amount)
                                : `${alert.data.amount} months`}
                            </span>
                          )}
                          {alert.data.change && (
                            <span
                              className={cn(
                                'flex items-center gap-1',
                                alert.data.change > 0 ? 'text-emerald-500' : 'text-red-500'
                              )}
                            >
                              {alert.data.change > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {alert.data.change > 0 ? '+' : ''}
                              {alert.data.change}%
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(new Date(alert.timestamp))}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dismissAlert(alert.id)
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-blue-500 relative cursor-pointer">
                <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified on mobile</p>
                </div>
              </div>
              <div className="w-11 h-6 rounded-full bg-slate-300 dark:bg-slate-600 relative cursor-pointer">
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
