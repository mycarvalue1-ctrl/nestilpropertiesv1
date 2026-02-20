'use server';

import { aiPropertyRecommendations, type AiPropertyRecommendationsInput } from '@/ai/flows/ai-property-recommendations';
import type { Property } from '@/lib/types';

// Helper function to map detailed property types to the simplified enum for the AI model
function mapPropertyTypeForAI(type: string | undefined): 'house' | 'flat' | 'land' | 'commercial' {
    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('apartment') || lowerType.includes('flat') || lowerType.includes('pg')) {
        return 'flat';
    }
    if (lowerType.includes('house') || lowerType.includes('villa')) {
        return 'house';
    }
    if (lowerType.includes('plot') || lowerType.includes('land')) {
        return 'land';
    }
    if (lowerType.includes('commercial')) {
        return 'commercial';
    }
    // Default to a reasonable value if no match is found
    return 'house';
}


export async function getSimilarProperties(property: Property) {
  try {
    const currentPrice = property.price ?? 0;

    const input: AiPropertyRecommendationsInput = {
      viewedProperty: {
        id: property.id,
        title: property.title,
        type: (property.status || 'For Sale').split(' ')[1].toLowerCase() as 'rent' | 'sale' | 'lease',
        propertyType: mapPropertyTypeForAI(property.type),
        price: currentPrice,
        areaSqFt: property.areaSqFt ?? 0,
        address: property.address,
        description: property.description || '',
        bhk: property.bhk,
        furnishing: property.furnishing?.toLowerCase() as 'furnished' | 'semi-furnished' | 'unfurnished' | undefined,
        amenities: property.amenities || [],
      },
      userPreferences: {
        // In a real app, these would come from the logged-in user's profile
        maxPrice: currentPrice > 0 ? currentPrice * 1.2 : 5000000,
        minPrice: currentPrice > 0 ? currentPrice * 0.8 : 0,
        preferredBHKs: property.bhk ? [property.bhk] : [],
        desiredAmenities: (property.amenities || []).slice(0, 2),
        preferredLocations: property.city ? [property.city] : [],
      }
    };

    const result = await aiPropertyRecommendations(input);
    return { success: true, data: result.recommendedProperties };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Be more specific about the error for debugging
    if (error instanceof Error) {
        return { success: false, error: `Failed to fetch recommendations: ${error.message}` };
    }
    return { success: false, error: 'Failed to fetch recommendations due to an unknown error.' };
  }
}
