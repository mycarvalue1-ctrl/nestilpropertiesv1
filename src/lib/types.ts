export type Property = {
  id: string;
  title: string;
  status: 'For Sale' | 'For Rent' | 'For Lease';
  type: 'House' | 'Flat' | 'Land' | 'Commercial';
  price: number;
  areaSqFt: number;
  address: string;
  city: string;
  pincode: string;
  description: string;
  photos: string[];
  owner: {
    name: string;
    phone: string;
    isAgent: boolean;
    verified: boolean;
  };
  amenities: string[];
  nearbyPlaces: {
    name: string;
    distance: string;
  }[];
  beds: number;
  baths: number;
  bhk?: string;
  furnishing?: 'Furnished' | 'Semi-furnished' | 'Unfurnished';
  featured: boolean;
  listingStatus: 'approved' | 'pending' | 'rejected';
  dateAdded: string;
  isNew?: boolean;
  isUrgent?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  role: 'Owner' | 'Agent' | 'Builder';
  listings: number;
};
