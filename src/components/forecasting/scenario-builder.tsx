'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatCurrency, cn } from '@/lib/utils'
import {
    Plus,
    Trash2,
    TrendingUp,
    Palette,
    Percent,
    DollarSign,
} from 'lucide-react'

export interface CustomScenario {
    id: string
    name: string
    description: string
    growthRate: number
    probability: number
    color: string
    endMRR: number
    isCustom?: boolean
}

interface ScenarioBuilderProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentMRR: number
    onSave: (scenario: CustomScenario) => void
    editingScenario?: CustomScenario | null
}

const PRESET_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
]

export function ScenarioBuilder({
    open,
    onOpenChange,
    currentMRR,
    onSave,
    editingScenario,
}: ScenarioBuilderProps) {
    const [name, setName] = useState(editingScenario?.name || '')
    const [description, setDescription] = useState(editingScenario?.description || '')
    const [growthRate, setGrowthRate] = useState(editingScenario?.growthRate || 10)
    const [probability, setProbability] = useState(editingScenario?.probability || 50)
    const [color, setColor] = useState(editingScenario?.color || PRESET_COLORS[0])

    // Calculate projected MRR based on growth rate (12 months compound)
    const projectedMRR = currentMRR * Math.pow(1 + growthRate / 100, 12)

    const handleSave = () => {
        const scenario: CustomScenario = {
            id: editingScenario?.id || `custom-${Date.now()}`,
            name: name || 'Custom Scenario',
            description: description || `${growthRate}% monthly growth`,
            growthRate,
            probability,
            color,
            endMRR: projectedMRR,
            isCustom: true,
        }
        onSave(scenario)
        resetForm()
        onOpenChange(false)
    }

    const resetForm = () => {
        setName('')
        setDescription('')
        setGrowthRate(10)
        setProbability(50)
        setColor(PRESET_COLORS[0])
    }

    const handleClose = () => {
        resetForm()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <Plus className="w-5 h-5 text-blue-500" />
                        {editingScenario ? 'Edit Scenario' : 'Create Custom Scenario'}
                    </DialogTitle>
                    <DialogDescription>
                        Define your own growth scenario to explore different futures.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Scenario Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Scenario Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Aggressive Expansion"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the assumptions behind this scenario..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Growth Rate Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Monthly Growth Rate
                            </label>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {growthRate.toFixed(1)}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="-10"
                            max="50"
                            step="0.5"
                            value={growthRate}
                            onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>-10%</span>
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Probability Slider */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Percent className="w-4 h-4 text-purple-500" />
                                Probability
                            </label>
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {probability}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={probability}
                            onChange={(e) => setProbability(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Palette className="w-4 h-4 text-blue-500" />
                            Scenario Color
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all hover:scale-110",
                                        color === c && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-blue-500"
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Preview Card */}
                    <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {name || 'Scenario Preview'}
                                </span>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                {probability}% likely
                            </span>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                                    <DollarSign className="w-3.5 h-3.5" />
                                    Projected MRR (EOY)
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(projectedMRR)}
                                </p>
                            </div>
                            <div className={cn(
                                "text-lg font-semibold",
                                growthRate >= 0 ? "text-emerald-500" : "text-red-500"
                            )}>
                                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%/mo
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="gradient" onClick={handleSave}>
                        <Plus className="w-4 h-4 mr-2" />
                        {editingScenario ? 'Update Scenario' : 'Create Scenario'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Delete Confirmation Dialog
interface DeleteScenarioDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    scenarioName: string
    onConfirm: () => void
}

export function DeleteScenarioDialog({
    open,
    onOpenChange,
    scenarioName,
    onConfirm,
}: DeleteScenarioDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Delete Scenario
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &ldquo;{scenarioName}&rdquo;? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
