'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { locationData as staticLocationData, type State, type District } from '@/lib/locations';

type Location = {
  state: string;
  district: string;
  locality: string;
};

export function LocationSelector({ className }: { className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [districts, setDistricts] = useState<District[]>([]);

  const [locationData] = useState<State[]>(staticLocationData);

  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string>('');

  const [savedLocation, setSavedLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const handleLocationUpdate = () => {
      try {
        const locationJson = localStorage.getItem('userLocation');
        if (locationJson) {
          const parsedLocation = JSON.parse(locationJson);
          setSavedLocation(parsedLocation);
        } else {
          // Set a default if nothing is in localStorage and save it.
          const defaultLocation = {
            state: 'Andhra Pradesh',
            district: 'NTR district',
            locality: 'Vijayawada',
          };
          localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
          setSavedLocation(defaultLocation);
        }
      } catch (error) {
        console.error("Could not parse location from localStorage", error);
      }
    };

    handleLocationUpdate(); // Run once on mount

    window.addEventListener('location-changed', handleLocationUpdate); // Listen for external changes

    return () => {
      window.removeEventListener('location-changed', handleLocationUpdate);
    };
  }, []); // Empty dependency array ensures this runs only once on the client after mount.

  const handleStateChange = (stateName: string) => {
    const state = locationData.find((s) => s.name === stateName);
    if (state) {
      setSelectedState(state);
      setDistricts(state.districts);
      setSelectedDistrict(null);
      setSelectedLocality('');
      setStep(2);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    const district = districts.find((d) => d.name === districtName);
    if (district) {
      setSelectedDistrict(district);
      setSelectedLocality('');
      setStep(3);
    }
  };

  const saveLocation = () => {
    if (selectedState && selectedDistrict && selectedLocality) {
      const newLocation = {
        state: selectedState.name,
        district: selectedDistrict.name,
        locality: selectedLocality,
      };
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      window.dispatchEvent(new CustomEvent('location-changed')); // This will trigger the useEffect listener to update state
      setIsModalOpen(false);
      toast({
        title: "Location Updated!",
        description: `Your location has been set to ${newLocation.locality}, ${newLocation.district}.`,
      });
    }
  };
  
  const openModal = () => {
      // Pre-fill the modal with the currently saved location
      if (savedLocation) {
        const state = locationData.find(s => s.name === savedLocation.state);
        if (state) {
            setSelectedState(state);
            setDistricts(state.districts);
            const district = state.districts.find(d => d.name === savedLocation.district);
            if (district) {
                setSelectedDistrict(district);
                setStep(3);
            } else {
                setStep(2);
            }
            setSelectedLocality(savedLocation.locality || '');
        }
      }
      setIsModalOpen(true);
  }

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground",
          className
        )}
        onClick={openModal}
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[100px] md:max-w-[150px]">
          {savedLocation
            ? `${savedLocation.locality}, ${savedLocation.district}`
            : 'Select Location'}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Your Location</DialogTitle>
            <DialogDescription>
              Choose your location to get personalized property listings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">State</label>
              <Select
                onValueChange={handleStateChange}
                value={selectedState?.name || ''}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {locationData.map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {step >= 2 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">District</label>
                <Select
                  onValueChange={handleDistrictChange}
                  value={selectedDistrict?.name || ''}
                  disabled={!selectedState}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.name} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step >= 3 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="locality-input" className="text-right">Locality</label>
                <Input
                    id="locality-input"
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter locality"
                    disabled={!selectedDistrict}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={saveLocation}
              disabled={!selectedState || !selectedDistrict || !selectedLocality}
            >
              Save location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
