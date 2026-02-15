'use client';

import { useEffect, useState } from 'react';
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
import { Upload, CalendarIcon, Sparkles, MapPin } from 'lucide-react';
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

const amenitiesList = [
  'Parking', 'Lift', 'Borewell Water', 'Municipal Water', 'Power Backup',
  'Security', 'CCTV', 'Gated Community', 'Balcony', 'Terrace Access', 'Pets Allowed'
];

// Zod schema for form validation
const formSchema = z.object({
  propertyType: z.string({ required_error: "Property type is required." }).min(1, "Property type is required."),
  listingFor: z.enum(['Rent', 'Sale', 'Lease'], { required_error: "Please select a listing type." }),
  title: z.string().min(10, "Title must be at least 10 characters.").max(100),
  description: z.string().min(50, "Description must be at least 50 characters."),
  
  state: z.string().optional(),
  city: z.string({ required_error: "City is required." }).min(1, "City is required."),
  locality: z.string({ required_error: "Area/Locality is required." }).min(1, "Area/Locality is required."),
  landmark: z.string().optional(),
  pincode: z.string().length(6, "Pincode must be 6 digits."),
  
  price: z.coerce.number({ required_error: 'Price is required.' }).min(1, "Price must be a positive number."),
  negotiable: z.enum(['Yes', 'No']),
  maintenance: z.coerce.number().optional(),
  deposit: z.coerce.number().optional(),
  availableFrom: z.date().optional(),
  preferredTenants: z.enum(['Family', 'Bachelor', 'Anyone']).optional(),

  amenities: z.array(z.string()).optional(),

  ownerName: z.string({ required_error: "Owner name is required." }).min(1, "Owner name is required."),
  mobile: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  whatsAppAvailable: z.boolean().default(true),
  postedBy: z.enum(['Owner', 'Agent', 'Builder'], { required_error: "Please specify who is posting." }),

  // Conditional fields
  details: z.any(),
}).superRefine((data, ctx) => {
  if (data.listingFor === 'Rent' && !data.deposit) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deposit is required for rentals.',
      path: ['deposit'],
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

export default function PostPropertyPage() {
  const { toast } = useToast();
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
      landmark: '',
      pincode: '',
      price: 0,
      negotiable: 'No',
      maintenance: 0,
      deposit: 0,
      availableFrom: undefined,
      preferredTenants: 'Anyone',
      amenities: [],
      ownerName: '',
      mobile: '',
      whatsAppAvailable: true,
      postedBy: 'Owner',
      details: {},
    },
  });

  const propertyType = useWatch({ control: form.control, name: 'propertyType' });

  useEffect(() => {
    try {
      const locationJson = localStorage.getItem('userLocation');
      if (locationJson) {
        const savedLocation = JSON.parse(locationJson);
        if (savedLocation.state) {
            form.setValue('state', savedLocation.state);
        }
        if (savedLocation.locality) { // As per data structure, locality is city/town
          form.setValue('city', savedLocation.district);
          form.setValue('locality', savedLocation.locality);
        }
      }
    } catch (error) {
      console.error("Could not parse location from localStorage", error);
    }
  }, [form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
        title: "Submission Successful!",
        description: "Your property has been submitted for approval.",
    })
  }

  return (
    <div className="container py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">Post a New Property</h1>
            <p className="text-muted-foreground mt-2">Fill in the details below to put your property on the market.</p>
          </div>

          <FormSection title="Basic Information" description="Start with the essential details about your property.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="propertyType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select property type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {['Apartment', 'Independent House', 'Villa', 'Plot', 'Commercial', 'PG'].map(type => 
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
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                           {['Sale', 'Rent', 'Lease'].map(type => (
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
                    <div className="relative">
                        <FormControl><Input placeholder="e.g., 2BHK House near Bus Stand" {...field} /></FormControl>
                        <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-auto py-0.5 px-2 text-primary hover:bg-primary/10">
                            <Sparkles className="mr-1 h-4 w-4"/> Auto-generate
                        </Button>
                    </div>
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
                <FormField control={form.control} name="landmark" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Landmark</FormLabel>
                        <FormControl><Input placeholder="e.g., Near RTC Bus Stand" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
             </div>
             <FormField control={form.control} name="pincode" render={({ field }) => (
                <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl><Input placeholder="6-digit pincode" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <div>
                <Label>Pin Location on Map</Label>
                 <div className="mt-2 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center">
                    <MapPin className="h-10 w-10 text-muted-foreground mb-2"/>
                    <Button type="button" variant="outline">Drag & Select on Google Map</Button>
                    <p className="text-xs text-muted-foreground mt-2">Location accuracy gets you more calls.</p>
                </div>
            </div>
          </FormSection>

          <FormSection title="Price & Availability">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expected Price / Monthly Rent (₹)</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 4500000" {...field} /></FormControl>
                             <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="negotiable" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Negotiable?</FormLabel>
                             <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Yes" id="neg-yes" /></FormControl><Label htmlFor="neg-yes">Yes</Label></FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="No" id="neg-no" /></FormControl><Label htmlFor="neg-no">No</Label></FormItem>
                                </RadioGroup>
                            </FormControl>
                        </FormItem>
                    )} />
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
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
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
          </FormSection>

          {propertyType && (
            <FormSection title="Property Details">
              {['Apartment', 'Independent House', 'Villa'].includes(propertyType) && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <FormField control={form.control} name="details.bhk" render={({ field }) => (<FormItem><FormLabel>BHK</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Beds"/></SelectTrigger></FormControl><SelectContent>{['1', '2', '3', '4+'].map(v => <SelectItem key={v} value={v}>{v} BHK</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="details.bathrooms" render={({ field }) => (<FormItem><FormLabel>Bathrooms</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Baths"/></SelectTrigger></FormControl><SelectContent>{['1', '2', '3', '4+'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="details.floor" render={({ field }) => (<FormItem><FormLabel>Floor</FormLabel><FormControl><Input placeholder="e.g., 3" {...field}/></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="details.totalFloors" render={({ field }) => (<FormItem><FormLabel>Total Floors</FormLabel><FormControl><Input placeholder="e.g., 5" {...field}/></FormControl><FormMessage /></FormItem>)} />
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <FormField control={form.control} name="details.area" render={({ field }) => (<FormItem><FormLabel>Built-up Area (sqft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1200" {...field}/></FormControl><FormMessage /></FormItem>)} />
                       <FormField control={form.control} name="details.facing" render={({ field }) => (<FormItem><FormLabel>Facing</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select direction"/></SelectTrigger></FormControl><SelectContent>{['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                       <FormField control={form.control} name="details.age" render={({ field }) => (<FormItem><FormLabel>Age of Property</FormLabel><FormControl><Input placeholder="e.g., 2 years" {...field}/></FormControl><FormMessage /></FormItem>)} />
                   </div>
                   <FormField control={form.control} name="details.furnishing" render={({ field }) => (<FormItem><FormLabel>Furnishing</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">{['Unfurnished', 'Semi-furnished', 'Fully-furnished'].map(type => (<FormItem key={type} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={type} id={`furnish-${type}`} /></FormControl><Label htmlFor={`furnish-${type}`}>{type}</Label></FormItem>))}</RadioGroup></FormControl><FormMessage /></FormItem>)} />
                </div>
              )}
              {propertyType === 'Plot' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="details.plotArea" render={({ field }) => (<FormItem><FormLabel>Plot Area (sq yards)</FormLabel><FormControl><Input type="number" placeholder="e.g., 200" {...field}/></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.facing" render={({ field }) => (<FormItem><FormLabel>Plot Facing</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Select direction"/></SelectTrigger></FormControl><SelectContent>{['East', 'West', 'North', 'South'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.roadWidth" render={({ field }) => (<FormItem><FormLabel>Road Width (ft)</FormLabel><FormControl><Input type="number" placeholder="e.g., 40" {...field}/></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="details.approved" render={({ field }) => (<FormItem><FormLabel>DTCP / RERA Approved?</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Yes" /></FormControl><Label>Yes</Label></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="No" /></FormControl><Label>No</Label></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
                  </div>
              )}
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
          </FormSection>

          <FormSection title="Photos & Media" description="Listings with good quality photos get 5x more responses.">
             <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
                <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                <p className="font-semibold">Click or drag files here to upload</p>
                <p className="text-sm text-muted-foreground">Upload at least 3 photos. PNG, JPG up to 10 photos.</p>
            </div>
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
                            <FormDescription>Can buyers contact you on WhatsApp?</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="postedBy" render={({ field }) => (
                    <FormItem>
                        <FormLabel>You are a...</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
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

          <Button size="lg" type="submit" className="w-full text-lg" variant="accent">Submit for Approval</Button>
        </form>
      </Form>
    </div>
  );
}
