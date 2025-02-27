import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from 'next/dynamic';
import { GeoDistributionItem } from '@/lib/types/api.types';
import indiaGeoJson from './india.json';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';

// Instead, dynamically import the Map component with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Tooltip = dynamic(
  () => import('react-leaflet').then((mod) => mod.Tooltip),
  { ssr: false }
);

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

// City coordinates (latitude, longitude)
const cityCoordinates: { [key: string]: [number, number] } = {
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.6139, 77.2090],
  'bangalore': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
  'ahmedabad': [23.0225, 72.5714],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'pune': [18.5204, 73.8567],
  'jaipur': [26.9124, 75.7873],
  'lucknow': [26.8467, 80.9462],
  'kochi': [9.9312, 76.2673],
  'gurgaon': [28.4595, 77.0266],
  'thane': [19.2183, 72.9781],
  'bhubaneswar': [20.2961, 85.8245],
  'mysuru': [12.2958, 76.6394],
  'jodhpur': [26.2389, 73.0243],
  'dhanbad': [23.7957, 86.4304],
  'raipur': [21.2514, 81.6296],
  'jammu': [32.7266, 74.8570],
  'cherthala': [9.6836, 76.3347],
  'brahmavar': [13.4274, 74.7478],
  'new delhi': [28.6139, 77.2090],
};

interface Props {
  data: GeoDistributionItem[];
}

export function IndiaHeatmap({ data }: Props) {
  const [selectedMarker, setSelectedMarker] = useState<GeoDistributionItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Add useEffect for Leaflet CSS
  useEffect(() => {
    setMapLoaded(true);
  }, []);

  const markers = data
    .filter(item => cityCoordinates[item.location.toLowerCase()])
    .map(item => {
      const maxCount = Math.max(...data.map(d => d.count));
      const maxAmount = Math.max(...data.map(d => d.totalAmount));
      const normalizedCount = item.count / maxCount;
      const normalizedAmount = item.totalAmount / maxAmount;
      
      return {
        coordinates: cityCoordinates[item.location.toLowerCase()],
        radius: 8 + (normalizedCount * 20), // Increased base radius and scale
        fillOpacity: 0.3 + normalizedAmount * 0.7,
        data: item
      };
    });

  if (!mapLoaded) {
    return (
      <Card className="col-span-2 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-gray-100">Scam Distribution Across India</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[650px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading map...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 bg-gray-900">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-gray-100">Scam Distribution Across India</CardTitle>
        {selectedMarker && (
          <div className="text-xs text-gray-400">
            {/* Selected: {selectedMarker.location} */}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[650px]">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "100%", width: "100%", background: "#0a0f1a" }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <GeoJSON
              data={indiaGeoJson as GeoJsonObject}
              style={{
                fillColor: '#1a2234',
                weight: 1.5,
                opacity: 0.8,
                color: '#2a3a50',
                fillOpacity: 0.1
              }}
            />

            {markers.map((marker, index) => (
              <CircleMarker
                key={index}
                center={marker.coordinates}
                radius={marker.radius}
                fillColor="#f44444"
                color="#ffffff"
                weight={1}
                fillOpacity={marker.fillOpacity}
                eventHandlers={{
                  mouseover: () => setSelectedMarker(marker.data),
                  mouseout: () => setSelectedMarker(null)
                }}
              >
                <Tooltip permanent={false} className="custom-tooltip">
                  <div className="bg-gray-900 text-white p-2 rounded shadow-lg">
                    <div className="font-bold text-lg mb-1">{marker.data.location}</div>
                    <div className="text-sm">
                      <div className="flex justify-between gap-4">
                        <span>Cases:</span>
                        <span className="font-semibold">{marker.data.count}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Amount:</span>
                        <span className="font-semibold">₹{marker.data.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
} 