
'use client';

import { useState, useEffect, useMemo } from 'react';
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
  subLocality?: string;
};

export function LocationSelector({ className }: { className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [districts, setDistricts] = useState<District[]>([]);

  const [locationData] = useState<State[]>(staticLocationData);

  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<string>('');
  const [selectedSubLocality, setSelectedSubLocality] = useState<string>('');

  const [savedLocation, setSavedLocation] = useState<Location | null>(null);
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleLocationUpdate = () => {
      try {
        const locationJson = localStorage.getItem('userLocation');
        if (locationJson) {
          const parsedLocation = JSON.parse(locationJson) as Location;
          setSavedLocation(parsedLocation);
        } else {
          const defaultLocation: Location = {
            state: 'Andhra Pradesh',
            district: 'NTR district',
            locality: 'Vijayawada',
            subLocality: '',
          };
          localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
          setSavedLocation(defaultLocation);
          window.dispatchEvent(new CustomEvent('location-changed'));
        }
      } catch (error) {
        console.error("Could not parse location from localStorage", error);
      }
    };

    handleLocationUpdate();

    window.addEventListener('location-changed', handleLocationUpdate);

    return () => {
      window.removeEventListener('location-changed', handleLocationUpdate);
    };
  }, []);

  const handleStateChange = (stateName: string) => {
    const state = locationData.find((s) => s.name === stateName);
    if (state) {
      setSelectedState(state);
      setDistricts(state.districts);
      setSelectedDistrict(null);
      setSelectedLocality('');
      setSelectedSubLocality('');
      setStep(2);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    const district = districts.find((d) => d.name === districtName);
    if (district) {
      setSelectedDistrict(district);
      setSelectedLocality('');
      setSelectedSubLocality('');
      setStep(3);
    }
  };

  const saveLocation = () => {
    if (selectedState && selectedDistrict && selectedLocality) {
      const newLocation: Location = {
        state: selectedState.name,
        district: selectedDistrict.name,
        locality: selectedLocality,
        subLocality: selectedSubLocality,
      };
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      window.dispatchEvent(new CustomEvent('location-changed'));
      setIsModalOpen(false);
      toast({
        title: "Location Updated!",
        description: `Your location has been set to ${newLocation.locality}, ${newLocation.district}.`,
      });
    }
  };
  
  const openModal = () => {
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
            setSelectedSubLocality(savedLocation.subLocality || '');
        }
      } else {
        setStep(1);
        setSelectedState(null);
        setSelectedDistrict(null);
        setSelectedLocality('');
        setSelectedSubLocality('');
      }
      setIsModalOpen(true);
  }

  const displayLocation = useMemo(() => {
    if (!isMounted || !savedLocation) {
      return 'Select Location';
    }
    const { district, locality, subLocality } = savedLocation;
    const mainPart = [subLocality, locality].filter(Boolean).join(', ');
    return mainPart ? `${mainPart}, ${district}` : district;
  }, [isMounted, savedLocation]);

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
          {displayLocation}
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
              <>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="sublocality-input" className="text-right">Sub-locality</label>
                  <Input
                      id="sublocality-input"
                      value={selectedSubLocality}
                      onChange={(e) => setSelectedSubLocality(e.target.value)}
                      className="col-span-3"
                      placeholder="Street, Colony (Optional)"
                      disabled={!selectedDistrict}
                  />
                </div>
              </>
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
