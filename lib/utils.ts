import { AverageRating, Rating } from "@/types"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import imageCompression from 'browser-image-compression'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAverageRating(ratings: Rating[]): AverageRating {
    const totalRatings = ratings.length
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    const averageRating = totalRating / totalRatings
    return { rating: averageRating || 0, count: totalRatings }
}

export function scaleAmount(amount: string | null, factor: number): string {
    if (!amount) return "";

    // Try to find a number at the start (fractions first, then decimals/integers)
    const match = amount.match(/^(\d+\/\d+|\d+(\.\d+)?)(.*)$/);
    if (!match) return amount;

    const numberPart = match[1];
    const rest = match[3];

    let value = 0;
    if (numberPart.includes("/")) {
        const [num, den] = numberPart.split("/").map(Number);
        value = num / den;
    } else {
        value = parseFloat(numberPart);
    }

    const scaledValue = value * factor;

    // Format nicely: max 2 decimals, remove trailing zeros
    const formattedValue = parseFloat(scaledValue.toFixed(2)).toString();

    return `${formattedValue}${rest}`;
}


export async function compressImage(file: File) {
    const options = {
        maxSizeMB: 1,              // Target max size (1 MB)
        maxWidthOrHeight: 1080,    // Resize to 1080px if larger
        useWebWorker: true
    }

    const compressedFile = await imageCompression(file, options)
    return compressedFile
}