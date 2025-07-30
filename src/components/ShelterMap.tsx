import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Shelter } from '../types/shelter';
import { Bed, Phone, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ShelterMapProps {
  shelters: Shelter[];
}

export default function ShelterMap({ shelters }: ShelterMapProps) {
  // Center on average of all shelter locations, default to NYC if no shelters
  const centerLat = shelters.length > 0 ? shelters.reduce((sum, s) => sum + s.latitude, 0) / shelters.length : 40.7128;
  const centerLng = shelters.length > 0 ? shelters.reduce((sum, s) => sum + s.longitude, 0) / shelters.length : -74.0060;

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {shelters.map((shelter) => (
          <Marker
            key={shelter.id}
            position={[shelter.latitude, shelter.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-3 min-w-[250px]">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">{shelter.name}</h3>
                
                <div className="flex items-center mb-3">
                  <Bed className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium">
                    {shelter.available_beds}/{shelter.total_beds} beds available
                  </span>
                </div>
                
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-600">{shelter.address}</span>
                </div>
                
                <div className="flex items-center mb-4">
                  <Phone className="h-4 w-4 mr-2 text-green-600" />
                  <a 
                    href={`tel:${shelter.contact_phone}`}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {shelter.contact_phone}
                  </a>
                </div>
                
                <div className={`px-3 py-2 rounded-lg text-xs font-bold text-center ${
                  shelter.available_beds === 0 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : shelter.available_beds / shelter.total_beds < 0.25 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {shelter.available_beds === 0 ? 'Currently Full' : `${shelter.available_beds} Beds Available`}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}