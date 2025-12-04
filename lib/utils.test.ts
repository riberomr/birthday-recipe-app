import { scaleAmount } from './utils';

describe('scaleAmount', () => {
    it('should scale integer amounts correctly', () => {
        expect(scaleAmount('100g', 2)).toBe('200g');
        expect(scaleAmount('1 cup', 0.5)).toBe('0.5 cup');
    });

    it('should scale fractional amounts correctly', () => {
        expect(scaleAmount('1/2 cup', 2)).toBe('1 cup');
        expect(scaleAmount('1/4 tsp', 4)).toBe('1 tsp');
    });

    it('should handle decimals', () => {
        expect(scaleAmount('1.5 kg', 2)).toBe('3 kg');
        expect(scaleAmount('0.5 L', 0.5)).toBe('0.25 L'); // 0.25 is formatted as 0.25
    });

    it('should handle amounts without units', () => {
        expect(scaleAmount('2', 3)).toBe('6');
    });

    it('should return empty string for null/empty input', () => {
        expect(scaleAmount(null, 2)).toBe('');
        expect(scaleAmount('', 2)).toBe('');
    });

    it('should return original string if no number found', () => {
        expect(scaleAmount('salt', 2)).toBe('salt');
    });
});
