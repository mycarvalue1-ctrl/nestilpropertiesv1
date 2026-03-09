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
import { MapPin, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { locationData as staticLocationData, type State, type District, type Locality } from '@/lib/locations';

type Location = {
  state: string;
  district: string;
  locality: string;
};

export function LocationSelector({ className }: { className?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [locationData] = useState<State[]>(staticLocationData);

  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null);

  const [districts, setDistricts] = useState<District[]>([]);
  const [localities, setLocalities] = useState<Locality[]>([]);

  const [savedLocation, setSavedLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const locationJson = localStorage.getItem('userLocation');
      if (locationJson) {
        setSavedLocation(JSON.parse(locationJson));
      } else {
        const defaultLocation = {
            state: 'Andhra Pradesh',
            district: 'NTR district',
            locality: 'Vijayawada'
        };
        localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
        setSavedLocation(defaultLocation);
      }
    } catch (error) {
      console.error("Could not parse location from localStorage", error)
    }
  }, []);

  const handleStateChange = (stateName: string) => {
    const state = locationData.find((s) => s.name === stateName);
    if (state) {
      setSelectedState(state);
      setDistricts(state.districts);
      setSelectedDistrict(null);
      setSelectedLocality(null);
      setStep(2);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    const district = districts.find((d) => d.name === districtName);
    if (district) {
      setSelectedDistrict(district);
      setLocalities(district.localities);
      setSelectedLocality(null);
      setStep(3);
    }
  };

  const handleLocalityChange = (localityName: string) => {
    const locality = localities.find((l) => l.name === localityName);
    if (locality) {
      setSelectedLocality(locality);
    }
  };

  const saveLocation = () => {
    if (selectedState && selectedDistrict && selectedLocality) {
      const newLocation = {
        state: selectedState.name,
        district: selectedDistrict.name,
        locality: selectedLocality.name,
      };
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      window.dispatchEvent(new CustomEvent('location-changed'));
      setSavedLocation(newLocation);
      setIsModalOpen(false);
      resetSelection();
      toast({
        title: "Location Updated!",
        description: `Your location has been set to ${newLocation.locality}, ${newLocation.district}.`,
      });
    }
  };
  
  const resetSelection = () => {
    setStep(1);
    setSelectedState(null);
    setSelectedDistrict(null);
    setSelectedLocality(null);
    setDistricts([]);
    setLocalities([]);
  }

  const openModal = () => {
      resetSelection();
      setIsModalOpen(true);
  }

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground",
          className
        )}
        onClick={openModal}
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[120px]">
          {savedLocation
            ? `${savedLocation.locality}, ${savedLocation.district}`
            : 'Select Location'}
        </span>
        <ChevronDown className="h-4 w-4" />
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
                <label className="text-right">Locality</label>
                <Select
                  onValueChange={handleLocalityChange}
                  value={selectedLocality?.name || ''}
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a locality" />
                  </SelectTrigger>
                  <SelectContent>
                    {localities.map((locality) => (
                      <SelectItem key={locality.name} value={locality.name}>
                        {locality.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
