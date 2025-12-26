/**
 * FinYeld AI - Forecasting Module Tests
 * Testing burn rate, runway, revenue forecasting, and anomaly detection
 */

import {
    calculateTrend,
    detectSeasonality,
    forecastRevenue,
    predictBurnRate,
    detectAnomalies,
    calculateRunwayScenarios,
    TimeSeriesPoint,
} from './forecasting'

// Helper to create date series
function createDateSeries(
    values: number[],
    startDate: Date = new Date('2024-01-01')
): TimeSeriesPoint[] {
    return values.map((value, index) => ({
        date: new Date(startDate.getTime() + index * 30 * 24 * 60 * 60 * 1000),
        value,
    }))
}

describe('Forecasting Module', () => {
    describe('calculateTrend', () => {
        it('should calculate positive growth trend', () => {
            const data = createDateSeries([10000, 12000, 14000, 16000, 18000, 20000])
            const trend = calculateTrend(data)

            expect(trend.slope).toBeGreaterThan(0)
            expect(trend.growthRate).toBeGreaterThan(0)
        })

        it('should calculate negative trend', () => {
            const data = createDateSeries([20000, 18000, 16000, 14000, 12000, 10000])
            const trend = calculateTrend(data)

            expect(trend.slope).toBeLessThan(0)
            expect(trend.growthRate).toBeLessThan(0)
        })

        it('should identify flat trend', () => {
            const data = createDateSeries([10000, 10000, 10000, 10000, 10000])
            const trend = calculateTrend(data)

            expect(Math.abs(trend.slope)).toBeLessThan(100)
            expect(Math.abs(trend.growthRate)).toBeLessThan(1)
        })

        it('should handle single data point', () => {
            const data = createDateSeries([10000])
            const trend = calculateTrend(data)

            expect(trend.slope).toBe(0)
            expect(trend.intercept).toBe(10000)
        })

        it('should handle empty data', () => {
            const trend = calculateTrend([])

            expect(trend.slope).toBe(0)
            expect(trend.intercept).toBe(0)
        })
    })

    describe('detectSeasonality', () => {
        it('should detect Q4 seasonality pattern', () => {
            // Higher values in Q4 (months 9-11: Oct-Dec)
            const monthlyData: TimeSeriesPoint[] = []
            for (let year = 0; year < 2; year++) {
                for (let month = 0; month < 12; month++) {
                    const baseValue = 10000
                    const seasonalBoost = month >= 9 ? 5000 : 0 // Q4 boost
                    monthlyData.push({
                        date: new Date(2022 + year, month, 1),
                        value: baseValue + seasonalBoost + Math.random() * 500,
                    })
                }
            }

            const seasonality = detectSeasonality(monthlyData)

            // Q4 months should have higher factors
            expect(seasonality.factors[9]).toBeGreaterThan(1)
            expect(seasonality.factors[10]).toBeGreaterThan(1)
            expect(seasonality.factors[11]).toBeGreaterThan(1)
            expect(seasonality.strength).toBeGreaterThan(0)
        })

        it('should return neutral factors for insufficient data', () => {
            const data = createDateSeries([10000, 12000, 11000])
            const seasonality = detectSeasonality(data)

            expect(seasonality.strength).toBe(0)
            seasonality.factors.forEach((f) => expect(f).toBe(1))
        })
    })

    describe('forecastRevenue', () => {
        it('should forecast future revenue', () => {
            const data = createDateSeries([
                50000, 55000, 60000, 65000, 70000, 75000,
                80000, 85000, 90000, 95000, 100000, 105000,
            ])

            const forecast = forecastRevenue(data, { months: 6, confidenceLevel: 0.95, includeSeasonality: false })

            expect(forecast.length).toBe(6)

            // Should predict continuing growth
            forecast.forEach((f, i) => {
                expect(f.predicted).toBeGreaterThan(100000) // Above last actual
                expect(f.upperBound).toBeGreaterThan(f.predicted)
                expect(f.lowerBound).toBeLessThan(f.predicted)
            })
        })

        it('should include confidence intervals', () => {
            const data = createDateSeries([10000, 12000, 11000, 13000, 12500, 14000])
            const forecast = forecastRevenue(data, { months: 3, confidenceLevel: 0.95, includeSeasonality: false })

            forecast.forEach((f) => {
                expect(f.upperBound).toBeGreaterThan(f.predicted)
                expect(f.lowerBound).toBeLessThan(f.predicted)
                expect(f.upperBound - f.lowerBound).toBeGreaterThan(0) // Non-zero interval
            })
        })
    })

    describe('predictBurnRate', () => {
        it('should predict future burn rate', () => {
            const expenses = createDateSeries([
                50000, 52000, 53000, 55000, 54000, 56000,
            ])

            const prediction = predictBurnRate(expenses, 3)

            expect(prediction.predictions.length).toBe(3)
            expect(prediction.averageBurn).toBeGreaterThan(0)
            expect(prediction.trend).toBeDefined()
        })

        it('should identify increasing burn trend', () => {
            const expenses = createDateSeries([40000, 45000, 50000, 55000, 60000, 65000])
            const prediction = predictBurnRate(expenses, 3)

            expect(prediction.trend).toBe('increasing')
        })

        it('should identify decreasing burn trend', () => {
            const expenses = createDateSeries([65000, 60000, 55000, 50000, 45000, 40000])
            const prediction = predictBurnRate(expenses, 3)

            expect(prediction.trend).toBe('decreasing')
        })

        it('should identify stable burn trend', () => {
            const expenses = createDateSeries([50000, 50500, 49500, 50000, 50200, 49800])
            const prediction = predictBurnRate(expenses, 3)

            expect(prediction.trend).toBe('stable')
        })
    })

    describe('detectAnomalies', () => {
        it('should detect unusually high expense', () => {
            const data = createDateSeries([
                10000, 10500, 9800, 10200, 50000, // 50000 is anomaly
                10100, 10300, 9900,
            ])

            const anomalies = detectAnomalies(data, 2)

            expect(anomalies.length).toBeGreaterThan(0)
            expect(anomalies.some((a) => a.value === 50000)).toBe(true)
        })

        it('should detect unusually low value', () => {
            const data = createDateSeries([
                50000, 52000, 48000, 51000, 5000, // 5000 is anomaly
                49000, 53000,
            ])

            const anomalies = detectAnomalies(data, 2)

            expect(anomalies.length).toBeGreaterThan(0)
            expect(anomalies.some((a) => a.value === 5000)).toBe(true)
        })

        it('should not flag normal variation', () => {
            const data = createDateSeries([
                10000, 10500, 9800, 10200, 10100, 10300, 9900,
            ])

            const anomalies = detectAnomalies(data, 3)

            expect(anomalies.length).toBe(0)
        })
    })

    describe('calculateRunwayScenarios', () => {
        it('should calculate optimistic, base, and pessimistic scenarios', () => {
            const scenarios = calculateRunwayScenarios(
                500000, // cash
                50000,  // burn
                10000,  // revenue
                5       // growth %
            )

            expect(scenarios.optimistic).toBeGreaterThan(scenarios.base)
            expect(scenarios.base).toBeGreaterThan(scenarios.pessimistic)
        })

        it('should return 0 runway for negative cash', () => {
            const scenarios = calculateRunwayScenarios(-10000, 50000, 0, 0)

            expect(scenarios.base).toBe(0)
            expect(scenarios.pessimistic).toBe(0)
        })

        it('should handle zero burn rate', () => {
            const scenarios = calculateRunwayScenarios(100000, 0, 1000, 0)

            expect(scenarios.base).toBeGreaterThan(12) // More than 1 year
        })

        it('should factor in revenue growth', () => {
            const withGrowth = calculateRunwayScenarios(200000, 30000, 10000, 20)
            const noGrowth = calculateRunwayScenarios(200000, 30000, 10000, 0)

            expect(withGrowth.optimistic).toBeGreaterThan(noGrowth.optimistic)
        })
    })
})

describe('Burn Rate Calculations', () => {
    it('should calculate monthly burn rate from expenses', () => {
        const expenses = [
            { amount: 50000, date: new Date('2024-01-01') },
            { amount: 45000, date: new Date('2024-02-01') },
            { amount: 55000, date: new Date('2024-03-01') },
        ]

        const total = expenses.reduce((sum, e) => sum + e.amount, 0)
        const averageBurn = total / expenses.length

        expect(averageBurn).toBe(50000)
    })

    it('should calculate runway correctly', () => {
        const cashBalance = 500000
        const monthlyBurn = 50000
        const monthlyRevenue = 0

        const netBurn = monthlyBurn - monthlyRevenue
        const runway = netBurn > 0 ? cashBalance / netBurn : 99

        expect(runway).toBe(10) // 10 months
    })

    it('should handle revenue reducing effective burn', () => {
        const cashBalance = 500000
        const monthlyBurn = 50000
        const monthlyRevenue = 30000

        const netBurn = monthlyBurn - monthlyRevenue
        const runway = netBurn > 0 ? cashBalance / netBurn : 99

        expect(runway).toBe(25) // 500000 / 20000 = 25 months
    })

    it('should return MAX runway when revenue exceeds burn', () => {
        const cashBalance = 100000
        const monthlyBurn = 30000
        const monthlyRevenue = 50000

        const netBurn = monthlyBurn - monthlyRevenue
        const runway = netBurn > 0 ? cashBalance / netBurn : 99

        expect(runway).toBe(99) // Profitable!
    })
})
