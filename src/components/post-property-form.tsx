
'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CalendarIcon, Sparkles, MapPin, X, LoaderCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ImageKit from 'imagekit-javascript';

const amenitiesList = [
  'Balcony', 'Borewell Water', 'Car Parking', 'CCTV', 'Electricity', 'Gated Community', 
  'Garden', 'Gym', 'Lift', 'Municipal Water', 'Pets Allowed', 'Power Backup', 'Security', 'Terrace Access'
];

const propertyTypes = [
    '1 BHK Flat', '2 BHK Flat', '3 BHK Flat', 'Independent House', 
    'Villa', 'Row House', 'Duplex', 'Studio Apartment', 'PG / Hostel', 'Land', 'Plot', 'Commercial', 'Agricultural Land'
];
const residentialTypes = ['1 BHK Flat', '2 BHK Flat', '3 BHK Flat', 'Independent House', 'Villa', 'Row House', 'Duplex', 'Studio Apartment', 'PG / Hostel'];


// Zod schema for form validation
const formSchema = z.object({
  propertyType: z.string({ required_error: "Property type is required." }).min(1, "Property type is required."),
  listingFor: z.enum(['Rent', 'Sale', 'Lease', 'PG'], { required_error: "Please select a listing type." }),
  title: z.string().min(10, "Title must be at least 10 characters.").max(100),
  description: z.string().min(50, "Description must be at least 50 characters."),
  
  state: z.string().optional(),
  city: z.string({ required_error: "City is required." }).min(1, "City is required."),
  locality: z.string({ required_error: "Area/Locality is required." }).min(1, "Area/Locality is required."),
  pincode: z.string().length(6, "Pincode must be 6 digits."),
  googleMapsLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  
  price: z.coerce.number({ required_error: 'Price is required.' }).min(0, "Price cannot be negative."),
  priceOnRequest: z.boolean().default(false),
  negotiable: z.enum(['Yes', 'No']),
  maintenance: z.coerce.number().optional().default(0),
  deposit: z.coerce.number().optional().default(0),
  availableFrom: z.date().optional(),
  preferredTenants: z.enum(['Family', 'Bachelor', 'Anyone']).optional(),
  visitAvailability: z.string().optional(),

  amenities: z.array(z.string()).optional(),
  nonVegAllowed: z.boolean().default(true),
  vehicleParking: z.string().optional(),
  photos: z.array(z.any()).max(10, 'You can upload up to 10 photos.').optional(),
  existingPhotos: z.array(z.string()).optional(),


  ownerName: z.string({ required_error: "Owner name is required." }).min(1, "Owner name is required."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  whatsAppAvailable: z.boolean().default(true),
  postedBy: z.enum(['Owner', 'Agent', 'Builder'], { required_error: "Please specify who is posting." }),

  details: z.object({
        bhk: z.string().default(''),
        bathrooms: z.string().default(''),
        floor: z.string().default(''),
        totalFloors: z.string().default(''),
        area: z.coerce.number().optional().default(0),
        facing: z.string().default(''),
        age: z.string().default(''),
        furnishing: z.string().default('Unfurnished'),
        plotArea: z.coerce.number().optional().default(0),
        roadWidth: z.coerce.number().optional().default(0),
        approved: z.string().default('No'),
      }).default({}),
}).superRefine((data, ctx) => {
  if (data.listingFor === 'Rent' && (data.deposit === undefined || data.deposit === null || data.deposit <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A positive deposit amount is required for rentals.',
      path: ['deposit'],
    });
  }
  if (!data.priceOnRequest && data.price <= 0) {
      ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price must be a positive number if "Price on Request" is not selected.',
          path: ['price'],
      });
  }
  const totalPhotos = (data.existingPhotos?.length || 0) + (data.photos?.length || 0);
  if (totalPhotos < 3) {
      ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please upload at least 3 photos.',
          path: ['photos'],
      });
  }
});


const FormSection = ({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode, className?: string }) => (
    <Card className={className}>
        <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
        {children}
        </CardContent>
    </Card>
);

export function PostPropertyFormComponent({ editId }: { editId: string | null }) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyType: '',
      listingFor: 'Rent',
      title: '',
      description: '',
      state: 'Andhra Pradesh',
      city: '',
      locality: '',
      pincode: '',
      googleMapsLink: '',
      price: 0,
      priceOnRequest: false,
      negotiable: 'No',
      maintenance: 0,
      deposit: 0,
      availableFrom: undefined,
      preferredTenants: 'Anyone',
      visitAvailability: '',
      amenities: [],
      nonVegAllowed: true,
      vehicleParking: 'None',
      photos: [],
      existingPhotos: [],
      ownerName: '',
      mobile: '',
      whatsAppAvailable: true,
      postedBy: 'Owner',
      details: {
        bhk: '',
        bathrooms: '',
        floor: '',
        totalFloors: '',
        area: 0,
        facing: '',
        age: '',
        furnishing: 'Unfurnished',
        plotArea: 0,
        roadWidth: 0,
        approved: 'No',
      },
    },
  });

  const propertyType = useWatch({ control: form.control, name: 'propertyType' });
  const watchedCity = useWatch({ control: form.control, name: 'city' });
  const watchedLocality = useWatch({ control: form.control, name: 'locality' });
  const watchedPrice = useWatch({ control: form.control, name: 'price' });
  const watchedArea = useWatch({ control: form.control, name: 'details.area' });
  const watchedPlotArea = useWatch({ control: form.control, name: 'details.plotArea' });
  const priceOnRequest = useWatch({ control: form.control, name: 'priceOnRequest' });

  const pricePerSqFt = useMemo(() => {
      const area = watchedArea > 0 ? watchedArea : watchedPlotArea;
      if (area > 0 && watchedPrice > 0) {
          return (watchedPrice / area).toFixed(2);
      }
      return '0.00';
  }, [watchedPrice, watchedArea, watchedPlotArea]);


  // This new effect syncs the form's location TO the global state (localStorage)
  useEffect(() => {
    const updateGlobalFromForm = () => {
      if (!watchedCity || !watchedLocality) {
        return;
      }
      
      try {
        const locationJson = localStorage.getItem('userLocation');
        const currentLocation = locationJson ? JSON.parse(locationJson) : {};

        const newLocation = {
          state: form.getValues('state') || 'Andhra Pradesh',
          district: watchedCity,
          locality: watchedLocality,
        };

        if (newLocation.district !== currentLocation.district || newLocation.locality !== currentLocation.locality) {
          localStorage.setItem('userLocation', JSON.stringify(newLocation));
          window.dispatchEvent(new CustomEvent('location-changed'));
        }
      } catch (error) {
        console.error("Could not update global location from form input", error);
      }
    };
    
    updateGlobalFromForm();
  }, [watchedCity, watchedLocality, form]);


  // This existing effect syncs the global state FROM localStorage to the form
  useEffect(() => {
    const updateLocationFields = () => {
      if (isEditing) return; // Don't override form values when editing
      try {
        const locationJson = localStorage.getItem('userLocation');
        if (locationJson) {
          const savedLocation = JSON.parse(locationJson);
          if (savedLocation.state) {
            form.setValue('state', savedLocation.state, { shouldValidate: true });
          }
          if (savedLocation.district) {
            form.setValue('city', savedLocation.district, { shouldValidate: true });
          }
          if (savedLocation.locality) {
            form.setValue('locality', savedLocation.locality, { shouldValidate: true });
          }
        }
      } catch (error) {
        console.error("Could not parse location from localStorage", error);
      }
    };

    // Run once on mount to get initial location
    updateLocationFields();

    // Listen for custom event when location is changed elsewhere
    window.addEventListener('location-changed', updateLocationFields);

    // Cleanup: remove event listener when component unmounts
    return () => {
      window.removeEventListener('location-changed', updateLocationFields);
    };
  }, [form, isEditing]);
  
  
  useEffect(() => {
    if (editId && firestore && user) {
        setIsEditing(true);
        setPropertyId(editId);
        const fetchPropertyData = async () => {
            const publicDocRef = doc(firestore, 'properties', editId);
            const privateDocRef = doc(firestore, 'propertyPrivateDetails', editId);

            const [publicDocSnap, privateDocSnap] = await Promise.all([
                getDoc(publicDocRef),
                getDoc(privateDocRef),
            ]);

            if (publicDocSnap.exists()) {
                const data = publicDocSnap.data();
                if (data.ownerId !== user.uid) {
                    toast({ variant: 'destructive', title: 'Unauthorized', description: "You don't have permission to edit this property." });
                    router.push('/dashboard/my-properties');
                    return;
                }

                const privateData = privateDocSnap.exists() ? privateDocSnap.data() : null;

                form.reset({
                    propertyType: data.propertyType,
                    listingFor: data.listingFor,
                    title: data.title,
                    description: data.description,
                    state: data.state || 'Andhra Pradesh',
                    city: data.city,
                    locality: data.address, // map address back to locality
                    pincode: data.pincode,
                    googleMapsLink: data.googleMapsLink,
                    price: data.price,
                    priceOnRequest: data.priceOnRequest || false,
                    negotiable: data.negotiable ? 'Yes' : 'No',
                    maintenance: data.maintenance,
                    deposit: data.deposit,
                    availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
                    preferredTenants: data.preferredTenants,
                    visitAvailability: data.visitAvailability,
                    amenities: data.amenities,
                    nonVegAllowed: data.nonVegAllowed,
                    vehicleParking: data.vehicleParking,
                    existingPhotos: data.photos,
                    photos: [],
                    ownerName: privateData?.ownerName || '',
                    mobile: privateData?.ownerPhone || '',
                    whatsAppAvailable: privateData?.whatsAppAvailable ?? true,
                    postedBy: data.postedByType,
                    details: {
                        bhk: data.bhk,
                        bathrooms: String(data.baths || ''),
                        floor: data.floor,
                        totalFloors: data.totalFloors,
                        area: data.areaSqFt,
                        facing: data.facing,
                        age: data.age,
                        furnishing: data.furnishing,
                        plotArea: data.plotArea,
                        roadWidth: data.roadWidth,
                        approved: data.dtcpApproved ? 'Yes' : 'No',
                    },
                });
            } else {
                toast({ variant: 'destructive', title: 'Not Found', description: 'Property not found.' });
                router.push('/dashboard/my-properties');
            }
        };
        fetchPropertyData();
    }
  }, [editId, firestore, user, form, router, toast]);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, field: any) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const filesArray = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
          if (filesArray.length === 0) {
              toast({
                  variant: "destructive",
                  title: "Invalid file type",
                  description: "Please upload only image files.",
              });
              return;
          }
          
          const currentFiles = field.value || [];
          const currentExisting = form.getValues('existingPhotos') || [];
          if (currentFiles.length + currentExisting.length + filesArray.length > 10) {
              toast({
                  variant: "destructive",
                  title: "Upload limit exceeded",
                  description: "You can upload a maximum of 10 photos.",
              });
          } else {
              field.onChange([...currentFiles, ...filesArray]);
          }
          e.dataTransfer.clearData();
      }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to post a property.",
      });
      router.push('/user-login');
      return;
    }
    
    setIsSubmitting(true);

    try {
      let uploadedPhotoURLs: string[] = [];
      if (values.photos && values.photos.length > 0) {
        
        const imagekit = new ImageKit({
            publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
            urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
        });

        const uploadPromises = values.photos.map(async (file) => {
          const authRes = await fetch('/api/imagekit/auth');
          if (!authRes.ok) {
              throw new Error(`Failed to authenticate ImageKit for ${file.name}.`);
          }
          const authParams = await authRes.json();
          
          return imagekit.upload({
            file: file,
            fileName: file.name,
            ...authParams,
            folder: `/nestil/properties/${user.uid}/`
          });
        });
        
        const results = await Promise.all(uploadPromises);
        uploadedPhotoURLs = results.map(res => res.url);
      }
      
      const finalPhotos = [...(values.existingPhotos || []), ...uploadedPhotoURLs];

      let bhkValue = values.details.bhk || '';
      let bedsValue = parseInt(bhkValue, 10) || 0;

      if (values.propertyType.includes('BHK Flat')) {
          bhkValue = values.propertyType.replace(' Flat', '');
          bedsValue = parseInt(bhkValue, 10);
      } else if (values.propertyType === 'Studio Apartment') {
          bhkValue = 'Studio';
          bedsValue = 1;
      }

      const publicDocData = {
        title: values.title,
        description: values.description,
        propertyType: values.propertyType,
        type: values.propertyType,
        listingFor: values.listingFor,
        status: `For ${values.listingFor}`,
        city: values.city,
        address: values.locality,
        pincode: values.pincode,
        googleMapsLink: values.googleMapsLink,
        price: values.priceOnRequest ? 0 : values.price,
        priceOnRequest: values.priceOnRequest,
        negotiable: values.negotiable === 'Yes',
        maintenance: values.maintenance,
        deposit: values.deposit,
        availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
        preferredTenants: values.preferredTenants,
        visitAvailability: values.visitAvailability,
        areaSqFt: values.details.area || values.details.plotArea || 0,
        bhk: bhkValue,
        beds: bedsValue,
        baths: Number(values.details.bathrooms?.charAt(0) || '0'),
        furnishing: values.details.furnishing,
        floor: values.details.floor,
        totalFloors: values.details.totalFloors,
        facing: values.details.facing,
        age: values.details.age,
        plotArea: values.details.plotArea,
        roadWidth: values.details.roadWidth,
        dtcpApproved: values.details.approved === 'Yes',
        amenities: values.amenities || [],
        nonVegAllowed: values.nonVegAllowed,
        vehicleParking: values.vehicleParking,
        photos: finalPhotos.length > 0 ? finalPhotos : ['https://ik.imagekit.io/ilk0tj3rj/nestil/assets/no-image-placeholder.png'],
        ownerId: user.uid,
        postedByType: values.postedBy,
        updatedAt: serverTimestamp(),
      };

      const privateDocData = {
          ownerName: values.ownerName,
          ownerPhone: values.mobile,
          ownerIsAgent: values.postedBy === 'Agent',
          ownerVerified: true, // Assuming verification,
          whatsAppAvailable: values.whatsAppAvailable,
      };
      
      if (isEditing && propertyId) {
        const batch = writeBatch(firestore);
        const publicDocRef = doc(firestore, 'properties', propertyId);
        batch.update(publicDocRef, {
            ...publicDocData,
            listingStatus: 'pending', // Reset status on edit to require re-approval
            isApproved: false,
        });

        const privateDocRef = doc(firestore, 'propertyPrivateDetails', propertyId);
        batch.set(privateDocRef, privateDocData, { merge: true });

        await batch.commit();
        toast({ title: "Update Successful!", description: "Your property has been updated and sent for re-approval." });
      } else {
        const publicCollectionRef = collection(firestore, 'properties');
        const newPublicDocRef = doc(publicCollectionRef); // Create a reference with a new ID

        const batch = writeBatch(firestore);

        batch.set(newPublicDocRef, {
            ...publicDocData,
            id: newPublicDocRef.id,
            postedAt: serverTimestamp(),
            dateAdded: new Date().toISOString(),
            isApproved: false,
            listingStatus: 'pending',
            isFeatured: false,
            isNew: true,
            isUrgent: false,
            nearbyPlaces: [],
        });

        const privateDocRef = doc(firestore, 'propertyPrivateDetails', newPublicDocRef.id);
        batch.set(privateDocRef, privateDocData);
        
        await batch.commit();
        toast({ title: "Submission Successful!", description: "Your property has been submitted for approval." });
      }

      form.reset();
      router.push('/dashboard/my-properties');

    } catch (error: any) {
      console.error('Error processing property: ', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred while saving your property.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleMapClick = () => {
    const city = form.getValues('city');
    const locality = form.getValues('locality');
    const query = encodeURIComponent(`${locality}, ${city}, ${form.getValues('state')}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">{isEditing ? 'Edit Property' : 'Post a New Property'}</h1>
            <p className="text-muted-foreground mt-2">{isEditing ? 'Update the details of your property.' : 'Fill in the details below to put your property on the market.'}</p>
          </div>

          <FormSection title="Basic Information" description="Start with the essential details about your property.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="propertyType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {propertyTypes.map(type => 
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="listingFor" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing For</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex items-center space-x-4 pt-2">
                           {['Sale', 'Rent', 'Lease', 'PG'].map(type => (
                             <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value={type} id={`listing-${type}`} /></FormControl>
                                <Label htmlFor={`listing-${type}`}>{type}</Label>
                            </FormItem>
                           ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl><Input placeholder="e.g., 2BHK House near Bus Stand" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Describe your property in detail..." rows={5} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )} />
          </FormSection>

          <FormSection title="Location Details" description="Accurate location helps attract the right tenants or buyers.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="state" render={({ field }) => (
                    <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl><Input {...field} disabled /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                        <FormLabel>City / Town</FormLabel>
                        <FormControl><Input placeholder="e.g., Vijayawada" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="locality" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area / Locality</FormLabel>
                        <FormControl><Input placeholder="e.g., Kanuru" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="pincode" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl><Input placeholder="6-digit pincode" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
            <FormField control={form.control} name="googleMapsLink" render={({ field }) => (
                <FormItem>
                    <FormLabel>Google Maps Link (Optional)</FormLabel>
                    <FormControl><Input placeholder="Paste Google Maps share link here" {...field} /></FormControl>
                    <FormDescription>
                        Open Google Maps, find the property, click Share, and copy the link.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
          </FormSection>

          <FormSection title="Price & Availability">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expected Price / Monthly Rent (₹)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 4500000" {...field} disabled={priceOnRequest} /></FormControl>
                            {!priceOnRequest && (
                                <FormDescription>
                                    Price per Sq.Ft: ₹{pricePerSqFt}
                                </FormDescription>
                            )}
                             <FormMessage />
                        </FormItem>
                    )} />
                    <div className="space-y-4">
                        <FormField control={form.control} name="priceOnRequest" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-[68px]">
                                <div className="space-y-0.5">
                                    <FormLabel>Price on Request</FormLabel>
                                    <FormDescription className="text-xs">Hide price from public view</FormDescription>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="negotiable" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Negotiable?</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex items-center space-x-4 pt-2">
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Yes" id="neg-yes" /></FormControl><Label htmlFor="neg-yes">Yes</Label></FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="No" id="neg-no" /></FormControl><Label htmlFor="neg-no">No</Label></FormItem>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="maintenance" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maintenance Charges (₹/month)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 2000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="deposit" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Advance / Deposit (₹)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 40000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="availableFrom" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Available From</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="preferredTenants" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred Tenants</FormLabel>
                             <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex items-center space-x-4 pt-2">
                                     {['Family', 'Bachelor', 'Anyone'].map(type => (
                                        <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value={type} id={`tenant-${type}`} /></FormControl>
                                            <Label htmlFor={`tenant-${type}`}>{type}</Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )} />
                </div>
                 <FormField control={form.control} name="visitAvailability" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Availability (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Available on weekends from 10 AM to 4 PM. Please call before visiting." {...field} /></FormControl>
                     <FormDescription>Let potential visitors know when you are generally available.</FormDescription>
                    <FormMessage />
                  </FormItem>
              )} />
          </FormSection>

          {propertyType && residentialTypes.includes(propertyType) && (
            <FormSection title="Property Details">
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  { !propertyType.includes('BHK') && propertyType !== 'Studio Apartment' && propertyType !== 'PG / Hostel' && (
                    <FormField control={form.control} name="details.bhk" render={({ field }) => (<FormItem><FormLabel>BHK</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Beds"/></SelectTrigger></FormControl><SelectContent>{['1', '2', '3', '4+'].map(v => <SelectItem key={v} value={`${v} BHK`}>{v} BHK</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  )}
                  <FormField control={form.control} name="details.bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Baths"/></SelectTrigger></FormControl><SelectContent>{['1', '2', '3', '4+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="details.floor" render={({ field }) => (<FormItem><FormLabel>Floor</FormLabel><FormControl><Input placeholder="e.g., 3" {...field}/></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="details.totalFloors" render={({ field }) => (<FormItem><FormLabel>Total Floors</FormLabel><FormControl><Input placeholder="e.g., 5" {...field}/></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <FormField control={form.control} name="details.area" render={({ field }) => (<FormItem><FormLabel>Built-up Area (sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200" {...field}/></FormControl><FormDescription>Area in Square Feet.</FormDescription><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="details.facing" render={({ field }) => (<FormItem><FormLabel>Facing</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select direction"/></SelectTrigger></FormControl><SelectContent>{['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                     <FormField control={form.control} name="details.age" render={({ field }) => (<FormItem><FormLabel>Age of Property</FormLabel><FormControl><Input placeholder="e.g., 2 years" {...field}/></FormControl><FormMessage /></FormItem>)} />
                 </div>
                 <FormField control={form.control} name="details.furnishing" render={({ field }) => (<FormItem><FormLabel>Furnishing</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">{['Unfurnished', 'Semi-furnished', 'Fully-furnished'].map(type => (<FormItem key={type} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={type} id={`furnish-${type}`} /></FormControl><Label htmlFor={`furnish-${type}`}>{type}</Label></FormItem>))}</RadioGroup></FormControl><FormMessage /></FormItem>)} />
              </div>
            </FormSection>
          )}

          {propertyType && ['Land', 'Plot', 'Agricultural Land'].includes(propertyType) && (
              <FormSection title="Land / Plot Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={form.control} name="details.plotArea" render={({ field }) => (<FormItem><FormLabel>Plot Area (sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 2400" {...field}/></FormControl><FormDescription>1 Sq Yard = 9 Sq Ft</FormDescription><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.roadWidth" render={({ field }) => (<FormItem><FormLabel>Road Width (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field}/></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.approved" render={({ field }) => (<FormItem><FormLabel>Layout Approved?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex items-center space-x-4 pt-2">{['Yes', 'No'].map(type => (<FormItem key={type} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={type} id={`approved-${type}`} /></FormControl><Label htmlFor={`approved-${type}`}>{type}</Label></FormItem>))}</RadioGroup></FormControl><FormMessage /></FormItem>)} />
                  </div>
              </FormSection>
          )}

          {propertyType && propertyType === 'Commercial' && (
              <FormSection title="Commercial Property Details">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="details.area" render={({ field }) => (<FormItem><FormLabel>Area (sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3000" {...field}/></FormControl><FormDescription>Total area in Square Feet.</FormDescription><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.facing" render={({ field }) => (<FormItem><FormLabel>Facing</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select direction"/></SelectTrigger></FormControl><SelectContent>{['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  </div>
              </FormSection>
          )}


          <FormSection title="Amenities" description="Select all the amenities available at your property.">
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenitiesList.map((item) => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="amenities"
                      render={({ field }) => {
                        return (
                          <FormItem key={item} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item}</FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <FormField
                    control={form.control}
                    name="vehicleParking"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Vehicle Parking</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select parking details" /></SelectTrigger></FormControl>
                            <SelectContent>
                            {['None', '1 Car', '2 Cars', '1 Bike', '2 Bikes', '1 Car & 1 Bike'].map(type => 
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            )}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="nonVegAllowed"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full">
                            <div className="space-y-0.5">
                                <FormLabel>Non-Veg Allowed?</FormLabel>
                                <FormDescription className="text-xs">Can tenants cook/consume non-veg food?</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                        </FormItem>
                    )}
                />
            </div>
          </FormSection>

          <FormSection title="Photos & Media" description="Listings with good quality photos get 5x more responses.">
            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div>
                      <Label
                        htmlFor="photo-upload"
                        className={cn(
                          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary block transition-colors",
                          isDragging && "border-primary bg-primary/10"
                        )}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field)}
                      >
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                        <p className="font-semibold">Click or drag files here to upload</p>
                        <p className="text-sm text-muted-foreground">Upload up to 10 photos. Max 25MB per file.</p>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            const filesArray = Array.from(e.target.files);
                            const currentFiles = field.value || [];
                            const currentExisting = form.getValues('existingPhotos') || [];
                            if (currentFiles.length + currentExisting.length + filesArray.length > 10) {
                              toast({
                                variant: "destructive",
                                title: "Upload limit exceeded",
                                description: "You can upload a maximum of 10 photos.",
                              });
                            } else {
                              field.onChange([...currentFiles, ...filesArray]);
                            }
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                      {form.getValues('existingPhotos')?.map((url: string, index: number) => (
                          <div key={index} className="relative group">
                            <Image
                                src={url}
                                alt={`existing photo ${index}`}
                                width={150}
                                height={150}
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                const newExisting = form.getValues('existingPhotos')?.filter((_: any, i: number) => i !== index);
                                form.setValue('existingPhotos', newExisting);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            </div>
                      ))}
                      {field.value?.map((file: File, index: number) => (
                        <div key={index} className="relative group">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`preview ${index}`}
                            width={150}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              const newFiles = field.value?.filter((_: any, i: number) => i !== index);
                              field.onChange(newFiles);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                </FormItem>
              )}
            />
          </FormSection>

           <FormSection title="Owner Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="mobile" render={({ field }) => (
                  <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input type="tel" placeholder="10-digit number for verification" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="whatsAppAvailable" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>WhatsApp Available?</FormLabel>
                            <FormDescription className="text-xs">Can buyers contact you on WhatsApp?</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="postedBy" render={({ field }) => (
                    <FormItem>
                        <FormLabel>You are a...</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} value={field.value} className="flex items-center space-x-4 pt-2">
                                {['Owner', 'Agent', 'Builder'].map(type => (
                                <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value={type} id={`postedby-${type}`} /></FormControl>
                                    <Label htmlFor={`postedby-${type}`}>{type}</Label>
                                </FormItem>
                                ))}
                            </RadioGroup>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )} />
            </div>
           </FormSection>

          <Button size="lg" type="submit" className="w-full text-lg" variant="accent" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                {isEditing ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
                isEditing ? 'Update Property' : 'Submit for Approval'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
