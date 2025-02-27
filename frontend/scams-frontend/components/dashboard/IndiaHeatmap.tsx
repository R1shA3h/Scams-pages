"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';
import { GeoDistributionItem } from '@/lib/types/api.types';
import { useMediaQuery } from '@/scams-frontend/hooks/use-media-query';

// City coordinates for major Indian cities
const cityCoordinates: Record<string, [number, number]> = {
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'bangalore': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'pune': [18.5204, 73.8567],
  'ahmedabad': [23.0225, 72.5714],
};

interface MapMarker {
  coordinates: [number, number];
  radius: number;
  fillOpacity: number;
  data: GeoDistributionItem;
}

// Dynamically import Leaflet map to avoid SSR issues
const Map = dynamic(
  () => import('react-leaflet').then((mod) => {
    // @ts-expect-error - CSS module import
    import('leaflet/dist/leaflet.css');
    const { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } = mod;

    // Responsive zoom control component
    function ResponsiveZoomControl({ isMobile }: { isMobile: boolean }) {
      const map = useMap();
      
      useEffect(() => {
        if (isMobile) {
          map.setZoom(4);
        } else {
          map.setZoom(5);
        }
      }, [isMobile, map]);
      
      return null;
    }

    return function LeafletMap({ 
      markers, 
      onMarkerSelect,
      isMobile 
    }: { 
      markers: MapMarker[], 
      onMarkerSelect: (marker: GeoDistributionItem | null) => void,
      isMobile: boolean 
    }) {
      const getMarkerRadius = (baseRadius: number) => {
        return isMobile ? baseRadius * 0.7 : baseRadius;
      };

      return (
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={isMobile ? 4 : 5}
          style={{ height: "100%", width: "100%", background: "#0a0f1a" }}
          zoomControl={false}
          attributionControl={false}
          className="leaflet-container"
        >
          <ResponsiveZoomControl isMobile={isMobile} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {markers.map((marker, index) => (
            <CircleMarker
              key={index}
              center={marker.coordinates}
              radius={getMarkerRadius(marker.radius)}
              fillColor="#ff4444"
              color="#ffffff"
              weight={1}
              fillOpacity={marker.fillOpacity}
              eventHandlers={{
                mouseover: () => onMarkerSelect(marker.data),
                mouseout: () => onMarkerSelect(null),
                click: () => onMarkerSelect(marker.data) // Add click for mobile
              }}
            >
              <Tooltip permanent={false}>
                <div className={`bg-gray-900 text-white p-2 rounded shadow-lg ${isMobile ? 'text-sm' : ''}`}>
                  <div className={`font-bold ${isMobile ? 'text-base' : 'text-lg'} mb-1`}>
                    {marker.data.location}
                  </div>
                  <div className={isMobile ? 'text-xs' : 'text-sm'}>
                    <div className="flex justify-between gap-2 sm:gap-4">
                      <span>Cases:</span>
                      <span className="font-semibold">{marker.data.count}</span>
                    </div>
                    <div className="flex justify-between gap-2 sm:gap-4">
                      <span>Amount:</span>
                      <span className="font-semibold">₹{marker.data.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      );
    };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] sm:h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center bg-gray-900">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    )
  }
);

export function IndiaHeatmap({ data }: { data: GeoDistributionItem[] }) {
  const [selectedMarker, setSelectedMarker] = useState<GeoDistributionItem | null>(null);
  const isMobile = useMediaQuery('(max-width: 640px)');

  const markers = data
    .filter(item => cityCoordinates[item.location.toLowerCase()])
    .map(item => ({
      coordinates: cityCoordinates[item.location.toLowerCase()],
      radius: 8 + (item.count / Math.max(...data.map(d => d.count)) * 20),
      fillOpacity: 0.3 + (item.totalAmount / Math.max(...data.map(d => d.totalAmount)) * 0.7),
      data: item
    }));

  return (
    <Card className="col-span-2 bg-gray-900">
      <CardHeader className="border-b border-gray-800 p-4 sm:p-6">
        <CardTitle className="text-gray-100 text-lg sm:text-xl md:text-2xl">
          Scam Distribution Across India
        </CardTitle>
        {selectedMarker && (
          <div className="text-xs sm:text-sm text-gray-400">
            Selected: {selectedMarker.location}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] sm:h-[450px] md:h-[550px] lg:h-[650px]">
          <Map 
            markers={markers} 
            onMarkerSelect={setSelectedMarker}
            isMobile={isMobile}
          />
        </div>
      </CardContent>
      {selectedMarker && isMobile && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            <div className="flex justify-between items-center mb-2">
              <span>Location:</span>
              <span className="font-semibold">{selectedMarker.location}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Cases:</span>
              <span className="font-semibold">{selectedMarker.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Amount:</span>
              <span className="font-semibold">₹{selectedMarker.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 