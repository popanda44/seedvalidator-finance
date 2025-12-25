/**
 * Prophet-Style Forecasting Service
 * 
 * Implements Holt-Winters Triple Exponential Smoothing for time-series forecasting
 * with trend and seasonality detection, similar to Facebook Prophet.
 */

export interface DataPoint {
    date: Date;
    value: number;
}

export interface ForecastPoint {
    date: Date;
    month: string;
    actual: number | null;
    projected: number;
    upperBound: number;
    lowerBound: number;
}

export interface ForecastResult {
    forecasts: ForecastPoint[];
    metrics: {
        mape: number;        // Mean Absolute Percentage Error
        mae: number;         // Mean Absolute Error
        confidenceLevel: number;
        trendDirection: 'up' | 'down' | 'stable';
        seasonalityDetected: boolean;
    };
    modelParams: {
        alpha: number;       // Level smoothing
        beta: number;        // Trend smoothing
        gamma: number;       // Seasonal smoothing
        seasonalPeriod: number;
    };
}

export interface ForecastOptions {
    horizonMonths?: number;
    confidenceLevel?: number;  // 0.95 = 95% confidence interval
    seasonalPeriod?: number;   // Default 12 for monthly data
}

/**
 * Holt-Winters Triple Exponential Smoothing Forecaster
 */
export class ProphetService {
    private alpha: number = 0.3;  // Level smoothing factor
    private beta: number = 0.1;   // Trend smoothing factor
    private gamma: number = 0.3;  // Seasonal smoothing factor

    /**
     * Main forecasting method
     */
    forecast(
        historicalData: DataPoint[],
        options: ForecastOptions = {}
    ): ForecastResult {
        const {
            horizonMonths = 12,
            confidenceLevel = 0.95,
            seasonalPeriod = 12
        } = options;

        // Need at least 2 data points
        if (historicalData.length < 2) {
            return this.generateFallbackForecast(
                historicalData[0]?.value || 10000,
                horizonMonths,
                confidenceLevel
            );
        }

        // Sort data chronologically
        const sortedData = [...historicalData].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        );

        const values = sortedData.map(d => d.value);

        // Detect if seasonality is present
        const seasonalityDetected = this.detectSeasonality(values, seasonalPeriod);

        // Optimize smoothing parameters
        const optimizedParams = this.optimizeParameters(values, seasonalPeriod, seasonalityDetected);
        this.alpha = optimizedParams.alpha;
        this.beta = optimizedParams.beta;
        this.gamma = optimizedParams.gamma;

        // Apply Holt-Winters
        const { level, trend, seasonal, fitted } = this.holtWinters(
            values,
            seasonalPeriod,
            seasonalityDetected
        );

        // Calculate forecast error for confidence intervals
        const errors = values.map((v, i) => Math.abs(v - fitted[i]));
        const rmse = Math.sqrt(errors.reduce((a, b) => a + b * b, 0) / errors.length);
        const zScore = this.getZScore(confidenceLevel);

        // Generate future forecasts
        const lastDate = sortedData[sortedData.length - 1].date;
        const forecasts: ForecastPoint[] = [];

        // Include last actual data point
        forecasts.push({
            date: lastDate,
            month: this.formatMonth(lastDate),
            actual: values[values.length - 1],
            projected: values[values.length - 1],
            upperBound: values[values.length - 1],
            lowerBound: values[values.length - 1]
        });

        // Generate future projections
        for (let h = 1; h <= horizonMonths; h++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setMonth(forecastDate.getMonth() + h);

            const seasonalIndex = seasonalityDetected
                ? seasonal[(values.length - seasonalPeriod + (h % seasonalPeriod)) % seasonalPeriod] || 1
                : 1;

            const pointForecast = (level + trend * h) * seasonalIndex;

            // Confidence interval widens with forecast horizon
            const intervalWidth = zScore * rmse * Math.sqrt(1 + h * 0.1);

            forecasts.push({
                date: forecastDate,
                month: this.formatMonth(forecastDate),
                actual: null,
                projected: Math.max(0, pointForecast),
                upperBound: Math.max(0, pointForecast + intervalWidth),
                lowerBound: Math.max(0, pointForecast - intervalWidth)
            });
        }

        // Calculate accuracy metrics
        const mape = this.calculateMAPE(values, fitted);
        const mae = this.calculateMAE(values, fitted);
        const trendDirection = this.getTrendDirection(trend, level);

        return {
            forecasts,
            metrics: {
                mape,
                mae,
                confidenceLevel,
                trendDirection,
                seasonalityDetected
            },
            modelParams: {
                alpha: this.alpha,
                beta: this.beta,
                gamma: this.gamma,
                seasonalPeriod
            }
        };
    }

    /**
     * Holt-Winters Triple Exponential Smoothing
     */
    private holtWinters(
        data: number[],
        seasonalPeriod: number,
        useSeasonality: boolean
    ): { level: number; trend: number; seasonal: number[]; fitted: number[] } {
        const n = data.length;

        // Initialize components
        let level = data[0];
        let trend = n > 1 ? (data[1] - data[0]) : 0;

        // Initialize seasonal factors
        const seasonal: number[] = new Array(seasonalPeriod).fill(1);
        if (useSeasonality && n >= seasonalPeriod) {
            const avgFirst = data.slice(0, seasonalPeriod).reduce((a, b) => a + b, 0) / seasonalPeriod;
            for (let i = 0; i < seasonalPeriod; i++) {
                seasonal[i] = avgFirst > 0 ? data[i] / avgFirst : 1;
            }
        }

        const fitted: number[] = [];

        // Apply smoothing
        for (let t = 0; t < n; t++) {
            const prevLevel = level;
            const prevTrend = trend;
            const seasonalIdx = t % seasonalPeriod;
            const seasonalFactor = useSeasonality ? seasonal[seasonalIdx] : 1;

            // Fitted value for this period
            const fittedValue = (prevLevel + prevTrend) * seasonalFactor;
            fitted.push(fittedValue);

            // Update level
            level = this.alpha * (data[t] / seasonalFactor) + (1 - this.alpha) * (prevLevel + prevTrend);

            // Update trend
            trend = this.beta * (level - prevLevel) + (1 - this.beta) * prevTrend;

            // Update seasonal
            if (useSeasonality) {
                seasonal[seasonalIdx] = this.gamma * (data[t] / level) + (1 - this.gamma) * seasonal[seasonalIdx];
            }
        }

        return { level, trend, seasonal, fitted };
    }

    /**
     * Detect seasonality using autocorrelation
     */
    private detectSeasonality(data: number[], period: number): boolean {
        if (data.length < period * 2) return false;

        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < data.length - period; i++) {
            numerator += (data[i] - mean) * (data[i + period] - mean);
        }

        for (let i = 0; i < data.length; i++) {
            denominator += Math.pow(data[i] - mean, 2);
        }

        const autocorr = denominator > 0 ? numerator / denominator : 0;

        // Seasonality detected if autocorrelation > 0.5
        return autocorr > 0.5;
    }

    /**
     * Simple parameter optimization using grid search
     */
    private optimizeParameters(
        data: number[],
        seasonalPeriod: number,
        useSeasonality: boolean
    ): { alpha: number; beta: number; gamma: number } {
        let bestAlpha = 0.3;
        let bestBeta = 0.1;
        let bestGamma = 0.3;
        let bestMAPE = Infinity;

        // Grid search (simplified for performance)
        const alphaRange = [0.1, 0.3, 0.5];
        const betaRange = [0.05, 0.1, 0.2];
        const gammaRange = [0.1, 0.3, 0.5];

        for (const alpha of alphaRange) {
            for (const beta of betaRange) {
                for (const gamma of gammaRange) {
                    this.alpha = alpha;
                    this.beta = beta;
                    this.gamma = gamma;

                    const { fitted } = this.holtWinters(data, seasonalPeriod, useSeasonality);
                    const mape = this.calculateMAPE(data, fitted);

                    if (mape < bestMAPE) {
                        bestMAPE = mape;
                        bestAlpha = alpha;
                        bestBeta = beta;
                        bestGamma = gamma;
                    }
                }
            }
        }

        return { alpha: bestAlpha, beta: bestBeta, gamma: bestGamma };
    }

    /**
     * Mean Absolute Percentage Error
     */
    private calculateMAPE(actual: number[], predicted: number[]): number {
        let totalError = 0;
        let count = 0;

        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== 0) {
                totalError += Math.abs((actual[i] - predicted[i]) / actual[i]);
                count++;
            }
        }

        return count > 0 ? (totalError / count) * 100 : 0;
    }

    /**
     * Mean Absolute Error
     */
    private calculateMAE(actual: number[], predicted: number[]): number {
        let totalError = 0;

        for (let i = 0; i < actual.length; i++) {
            totalError += Math.abs(actual[i] - predicted[i]);
        }

        return totalError / actual.length;
    }

    /**
     * Get Z-score for confidence level
     */
    private getZScore(confidenceLevel: number): number {
        const zScores: Record<number, number> = {
            0.90: 1.645,
            0.95: 1.96,
            0.99: 2.576
        };
        return zScores[confidenceLevel] || 1.96;
    }

    /**
     * Determine trend direction
     */
    private getTrendDirection(trend: number, level: number): 'up' | 'down' | 'stable' {
        const trendPercent = level > 0 ? (trend / level) * 100 : 0;
        if (trendPercent > 1) return 'up';
        if (trendPercent < -1) return 'down';
        return 'stable';
    }

    /**
     * Format date as "MMM 'YY"
     */
    private formatMonth(date: Date): string {
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }

    /**
     * Generate fallback forecast when insufficient data
     */
    private generateFallbackForecast(
        currentValue: number,
        horizonMonths: number,
        confidenceLevel: number
    ): ForecastResult {
        const monthlyGrowth = 0.05; // Assume 5% monthly growth
        const zScore = this.getZScore(confidenceLevel);
        const now = new Date();

        const forecasts: ForecastPoint[] = [{
            date: now,
            month: this.formatMonth(now),
            actual: currentValue,
            projected: currentValue,
            upperBound: currentValue,
            lowerBound: currentValue
        }];

        for (let h = 1; h <= horizonMonths; h++) {
            const forecastDate = new Date(now);
            forecastDate.setMonth(forecastDate.getMonth() + h);

            const projected = currentValue * Math.pow(1 + monthlyGrowth, h);
            const intervalWidth = projected * 0.15 * zScore * Math.sqrt(h);

            forecasts.push({
                date: forecastDate,
                month: this.formatMonth(forecastDate),
                actual: null,
                projected,
                upperBound: projected + intervalWidth,
                lowerBound: Math.max(0, projected - intervalWidth)
            });
        }

        return {
            forecasts,
            metrics: {
                mape: 15, // Default fallback MAPE
                mae: currentValue * 0.1,
                confidenceLevel,
                trendDirection: 'up',
                seasonalityDetected: false
            },
            modelParams: {
                alpha: 0.3,
                beta: 0.1,
                gamma: 0.3,
                seasonalPeriod: 12
            }
        };
    }
}

// Export singleton instance
export const prophetService = new ProphetService();
