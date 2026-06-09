"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:9999px;background:#4A90A4;box-shadow:0 2px 8px rgba(0,0,0,.25);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

export function TrainerLocationMap({
  lat,
  lon,
  onMapClick,
}: {
  lat: number;
  lon: number;
  onMapClick: (lat: number, lon: number) => void;
}) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={15}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]} icon={markerIcon} />
      <MapClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}
