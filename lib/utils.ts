import { AverageRating, Rating } from "@/types"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getAverageRating(ratings: Rating[]): AverageRating {
    const totalRatings = ratings.length
    const totalRating = ratings.reduce((acc, rating) => acc + rating.rating, 0)
    const averageRating = totalRating / totalRatings
    return { rating: averageRating || 0, count: totalRatings }
}

