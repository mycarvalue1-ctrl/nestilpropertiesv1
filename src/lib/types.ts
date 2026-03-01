
export type PropertyOwner = {
  id: string;
  name: string;
  phone: string;
  isAgent: boolean;
  verified: boolean;
};

export type Property = {
  id: string;
  title: string;
  status: 'For Sale' | 'For Rent' | 'For Lease';
  type: string;
  price: number;
  priceOnRequest?: boolean;
  areaSqFt: number;
  address: string;
  city: string;
  pincode: string;
  description: string;
  photos: string[];
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
  listingStatus: 'approved' | 'pending' | 'rejected' | 'rented' | 'sold' | 'archived';
  dateAdded: string;
  isNew?: boolean;
  isUrgent?: boolean;
  visitAvailability?: string;

  // Fields from form that were missing
  ownerId: string;
  postedByType: 'Owner' | 'Agent' | 'Builder';
  listingFor: 'Rent' | 'Sale' | 'Lease' | 'PG';
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
  subscriptionEndDate?: string;
  isBanned?: boolean;
};

export type SiteVisit = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  visitorId: string;
  ownerId: string;
  scheduledAt: string; // ISO string
  message: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: any; // serverTimestamp
  visitorName: string;
  visitorPhone: string;
};
