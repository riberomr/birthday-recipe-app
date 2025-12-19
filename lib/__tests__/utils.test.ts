import { scaleAmount, compressImage, cn, getAverageRating } from '../utils';
import imageCompression from 'browser-image-compression';

jest.mock('browser-image-compression', () => jest.fn());

describe('cn', () => {
    it('should merge classes correctly', () => {
        expect(cn('c1', 'c2')).toBe('c1 c2');
        expect(cn('c1', { c2: true, c3: false })).toBe('c1 c2');
        expect(cn('p-4 p-2')).toBe('p-2'); // Tailwind merge
    });
});

describe('getAverageRating', () => {
    it('should calculate average rating correctly', () => {
        const ratings: any[] = [{ rating: 5 }, { rating: 3 }];
        expect(getAverageRating(ratings)).toEqual({ rating: 4, count: 2 });
    });

    it('should return 0 for empty ratings', () => {
        expect(getAverageRating([])).toEqual({ rating: 0, count: 0 });
    });
});

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

describe('compressImage', () => {
    it('should compress image with correct options', async () => {
        const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
        const compressedFile = new File(['(compressed)'], 'cool.png', { type: 'image/png' });

        (imageCompression as unknown as jest.Mock).mockResolvedValue(compressedFile);

        const result = await compressImage(file);

        expect(imageCompression).toHaveBeenCalledWith(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1080,
            useWebWorker: true
        });
        expect(result).toBe(compressedFile);
    });
});
