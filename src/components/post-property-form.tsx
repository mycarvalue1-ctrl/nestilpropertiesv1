
'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { CalendarIcon, LoaderCircle, UploadCloud, X } from 'lucide-react';
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
import { useFirestore, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

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
  photos: z.string().min(1, "Please provide at least one image URL."),

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

export function FormSkeleton() {
    return (
        <div className="container py-12 max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <Skeleton className="h-9 w-72 mx-auto" />
                <Skeleton className="h-5 w-96 mx-auto" />
            </div>
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
}

export function PostPropertyFormComponent({ editId }: { editId: string | null }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
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
      photos: '',
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

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace(`/login?redirect=/post-property${editId ? `?edit=${editId}` : ''}`);
    }
  }, [isUserLoading, user, editId, router]);


  useEffect(() => {
    const updateLocationFields = () => {
      if (editId) return; 
      try {
        const locationJson = localStorage.getItem('userLocation');
        if (locationJson) {
          const savedLocation = JSON.parse(locationJson);
          if (savedLocation.state) form.setValue('state', savedLocation.state, { shouldValidate: true });
          if (savedLocation.district) form.setValue('city', savedLocation.district, { shouldValidate: true });
          if (savedLocation.locality) form.setValue('locality', savedLocation.locality, { shouldValidate: true });
        }
      } catch (error) { console.error("Could not parse location from localStorage", error); }
    };
    updateLocationFields();
    window.addEventListener('location-changed', updateLocationFields);
    return () => window.removeEventListener('location-changed', updateLocationFields);
  }, [form, editId]);
  
  useEffect(() => {
    if (user && !form.getValues('ownerName')) {
        form.setValue('ownerName', user.displayName || '');
    }
    if (user && !form.getValues('mobile')) {
        // Assuming phone number might be stored in Firestore user profile, not Auth
        // This part needs adjustment based on where phone number is actually stored
    }
  }, [user, form]);
  
  useEffect(() => {
    async function fetchPropertyData() {
        if (editId && firestore) {
            setIsLoading(true);
            const propDocRef = doc(firestore, 'properties', editId);
            const privateDocRef = doc(firestore, 'propertyPrivateDetails', editId);

            try {
                const [propDocSnap, privateDocSnap] = await Promise.all([getDoc(propDocRef), getDoc(privateDocRef)]);

                if (propDocSnap.exists()) {
                    const data = propDocSnap.data();
                    // Security check: only owner or admin can edit
                    if (user && (data.ownerId === user.uid || user.email === 'helpnestil@gmail.com')) {
                        const privateData = privateDocSnap.exists() ? privateDocSnap.data() : null;
                        const existingPhotos = data.photos || [];
                        setImageUrls(existingPhotos);

                        form.reset({
                            propertyType: data.propertyType,
                            listingFor: data.listingFor,
                            title: data.title,
                            description: data.description,
                            state: data.state || 'Andhra Pradesh',
                            city: data.city,
                            locality: data.address,
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
                            photos: existingPhotos.join(', '),
                            ownerName: privateData?.name || '',
                            mobile: privateData?.phone || '',
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
                        toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to edit this property.' });
                        router.push('/dashboard/my-properties');
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Not Found', description: 'Property not found.' });
                    router.push('/dashboard/my-properties');
                }
            } catch (error) {
                console.error("Error fetching property data: ", error);
                toast({ variant: 'destructive', title: 'Error', description: "Could not load property data."});
            } finally {
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }
    if (user) fetchPropertyData();
  }, [editId, firestore, form, router, toast, user]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to post a property." });
      return;
    }
    setIsSubmitting(true);

    const finalPhotos = values.photos
      ? values.photos.split(',').map(url => url.trim()).filter(Boolean)
      : [];
      
    const propertyData = {
      ownerId: user.uid,
      ownerName: values.ownerName,
      title: values.title, description: values.description, propertyType: values.propertyType, type: values.propertyType,
      listingFor: values.listingFor, status: `For ${values.listingFor}`, city: values.city, address: values.locality,
      pincode: values.pincode, googleMapsLink: values.googleMapsLink, price: values.priceOnRequest ? 0 : values.price,
      priceOnRequest: values.priceOnRequest, negotiable: values.negotiable === 'Yes', maintenance: values.maintenance,
      deposit: values.deposit, availableFrom: values.availableFrom ? values.availableFrom.toISOString() : null,
      preferredTenants: values.preferredTenants, visitAvailability: values.visitAvailability,
      areaSqFt: values.details.area || values.details.plotArea || 0,
      bhk: values.propertyType.includes('BHK') ? values.propertyType.replace(' Flat', '') : values.details.bhk,
      beds: parseInt(values.propertyType.charAt(0)) || parseInt(values.details.bhk.charAt(0)) || 0,
      baths: Number(values.details.bathrooms?.charAt(0) || '0'), furnishing: values.details.furnishing,
      floor: values.details.floor, totalFloors: values.details.totalFloors, facing: values.details.facing, age: values.details.age,
      plotArea: values.details.plotArea, roadWidth: values.details.roadWidth, dtcpApproved: values.details.approved === 'Yes',
      amenities: values.amenities || [], nonVegAllowed: values.nonVegAllowed, vehicleParking: values.vehicleParking,
      photos: finalPhotos.length > 0 ? finalPhotos : ['https://picsum.photos/seed/placeholder/800/600'],
      postedByType: values.postedBy,
      updatedAt: serverTimestamp(),
      ...(editId ? {} : { 
          postedAt: serverTimestamp(), 
          dateAdded: new Date().toISOString(), 
          isNew: true, 
          isFeatured: false, 
          isUrgent: false, 
          nearbyPlaces: [] 
      }),
      isApproved: false,
      listingStatus: 'pending',
    };

    const privateDocData = {
        ownerId: user.uid, // Denormalized for security rules
        name: values.ownerName, phone: values.mobile, isAgent: values.postedBy === 'Agent',
        verified: true, whatsAppAvailable: values.whatsAppAvailable,
    };
    
    try {
        if (editId) {
            const propRef = doc(firestore, 'properties', editId);
            await updateDoc(propRef, propertyData);
            const privateRef = doc(firestore, 'propertyPrivateDetails', editId);
            await setDoc(privateRef, privateDocData, { merge: true });
        } else {
            const newPropRef = await addDoc(collection(firestore, 'properties'), propertyData);
            await updateDoc(doc(firestore, 'properties', newPropRef.id), { id: newPropRef.id });
            const privateRef = doc(firestore, 'propertyPrivateDetails', newPropRef.id);
            await setDoc(privateRef, privateDocData);
        }
        toast({ title: editId ? "Update Successful!" : "Submission Successful!", description: "Your property has been submitted for review. Please allow up to 60 minutes for it to be approved and visible on the site."});
        form.reset();
        router.push(editId ? `/properties/${editId}` : '/dashboard/my-properties');
    } catch (error) {
        console.error('Error processing property: ', error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: editId ? `properties/${editId}` : `properties`,
          operation: editId ? 'update' : 'create',
          requestResourceData: { ...propertyData, ...privateDocData },
        }));
    } finally {
        setIsSubmitting(false);
    }
  }
  
    if (isLoading || isUserLoading) {
        return <FormSkeleton />;
    }

  return (
    <div className="container py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">{editId ? 'Edit Property' : 'Post a New Property'}</h1>
            <p className="text-muted-foreground mt-2">{editId ? 'Update the details of your property.' : 'Fill in the details below to put your property on the market.'}</p>
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

          <FormSection title="Photos" description="Add images of your property. The first image will be the main one.">
            <div className="space-y-4">
                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => {
                        if (result.event === 'success' && result.info?.secure_url) {
                            const newUrl = result.info.secure_url;
                            const updatedUrls = [...imageUrls, newUrl];
                            setImageUrls(updatedUrls);
                            form.setValue('photos', updatedUrls.join(', '), { shouldValidate: true });
                            toast({ title: "Image Uploaded", description: "Your image has been added." });
                        }
                    }}
                >
                    {({ open }) => {
                        return (
                            <Button type="button" variant="outline" onClick={() => open()}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload from Device
                            </Button>
                        );
                    }}
                </CldUploadWidget>

                <FormField
                    control={form.control}
                    name="photos"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Or paste image URLs (comma-separated)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="https://res.cloudinary.com/.../image1.jpg, https://res.cloudinary.com/.../image2.jpg"
                                    rows={4}
                                    {...field}
                                    onChange={(e) => {
                                        field.onChange(e);
                                        const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
                                        setImageUrls(urls);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                {imageUrls.length > 0 && (
                    <div className="space-y-2">
                        <Label>Image Previews</Label>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <Image
                                        src={url}
                                        alt={`Property image ${index + 1}`}
                                        width={150}
                                        height={100}
                                        className="object-cover rounded-md aspect-[3/2]"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            const updatedUrls = imageUrls.filter((_, i) => i !== index);
                                            setImageUrls(updatedUrls);
                                            form.setValue('photos', updatedUrls.join(', '), { shouldValidate: true });
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </FormSection>

           <FormSection title="Contact Details">
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
                {editId ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
                editId ? 'Update Property' : 'Submit for Approval'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
