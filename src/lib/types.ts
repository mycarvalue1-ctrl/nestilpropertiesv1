
export type Property = {
  id: string;
  title: string;
  status: 'For Sale' | 'For Rent' | 'For Lease';
  type: string;
  price: number;
  areaSqFt: number;
  address: string;
  city: string;
  pincode: string;
  description: string;
  photos: string[];
  owner: {
    id: string;
    name: string;
    phone: string;
    isAgent: boolean;
    verified: boolean;
  };
  amenities: string[];
  nonVegAllowed?: boolean;
  vehicleParking?: string;
  nearbyPlaces: {
    name: string;
    distance: string;
  }[];
  beds: number;
  baths: number;
  bhk?: string;
  furnishing?: 'Furnished' | 'Semi-furnished' | 'Unfurnished';
  featured: boolean;
  listingStatus: 'approved' | 'pending' | 'rejected' | 'rented' | 'sold';
  dateAdded: string;
  isNew?: boolean;
  isUrgent?: boolean;

  // Fields from form that were missing
  ownerId: string;
  listingFor: 'Rent' | 'Sale' | 'Lease';
  negotiable?: boolean;
  maintenance?: number;
  deposit?: number;
  availableFrom?: string | null;
  preferredTenants?: 'Family' | 'Bachelor' | 'Anyone';
  isApproved: boolean;
  floor?: string;
  totalFloors?: string;
  facing?: string;
  age?: string;
  plotArea?: number;
  roadWidth?: number;
  dtcpApproved?: boolean;
  postedAt: any; // Firestore ServerTimestamp
  updatedAt: any; // Firestore ServerTimestamp
  googleMapsLink?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateJoined: string;
  role: 'Owner' | 'Agent' | 'Builder';
  listings: number;
  credits?: number;
  isBanned?: boolean;
};

    