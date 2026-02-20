'use server';

import { aiPropertyRecommendations, type AiPropertyRecommendationsInput } from '@/ai/flows/ai-property-recommendations';
import type { Property } from '@/lib/types';

export async function getSimilarProperties(property: Property) {
  try {
    const input: AiPropertyRecommendationsInput = {
      viewedProperty: {
        id: property.id,
        title: property.title,
        type: (property.status || 'For Sale').split(' ')[1].toLowerCase() as 'rent' | 'sale' | 'lease',
        propertyType: (property.type || 'House').toLowerCase() as 'house' | 'flat' | 'land' | 'commercial',
        price: property.price,
        areaSqFt: property.areaSqFt,
        address: property.address,
        description: property.description || '',
        bhk: property.bhk,
        furnishing: property.furnishing?.toLowerCase() as 'furnished' | 'semi-furnished' | 'unfurnished' | undefined,
        amenities: property.amenities || [],
      },
      userPreferences: {
        // In a real app, these would come from the logged-in user's profile
        maxPrice: property.price * 1.2,
        minPrice: property.price * 0.8,
        preferredBHKs: property.bhk ? [property.bhk] : [],
        desiredAmenities: (property.amenities || []).slice(0, 2),
        preferredLocations: [property.city],
      }
    };

    const result = await aiPropertyRecommendations(input);
    return { success: true, data: result.recommendedProperties };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return { success: false, error: 'Failed to fetch recommendations.' };
  }
}
