import { formatCurrency, calculateRunway } from './utils'

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats USD by default', () => {
      expect(formatCurrency(1000)).toBe('$1,000')
    })

    it('formats with custom currency', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000')
    })
  })

  describe('calculateRunway', () => {
    it('calculates runway correctly', () => {
      expect(calculateRunway(100000, 10000)).toBe(10)
    })

    it('returns 99 for zero burn rate', () => {
      expect(calculateRunway(100000, 0)).toBe(99)
    })
  })
})
