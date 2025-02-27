"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoDistributionItem } from '@/lib/types/api.types';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface MapComponentProps {
  markers: {
    coordinates: [number, number];
    radius: number;
    fillOpacity: number;
    data: GeoDistributionItem;
  }[];
  onMarkerSelect: (marker: GeoDistributionItem | null) => void;
}

export default function MapComponent({ markers, onMarkerSelect }: MapComponentProps) {
  useEffect(() => {
    // Fix Leaflet icons in Next.js
    L.Icon.Default.imagePath = '/'
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
  }, []);

  return (
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

      {markers.map((marker, index) => (
        <CircleMarker
          key={index}
          center={marker.coordinates}
          radius={marker.radius}
          fillColor="#ff4444"
          color="#ffffff"
          weight={1}
          fillOpacity={marker.fillOpacity}
          eventHandlers={{
            mouseover: () => onMarkerSelect(marker.data),
            mouseout: () => onMarkerSelect(null)
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
  );
} 