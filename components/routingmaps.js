"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && !isNaN(position[0]) && !isNaN(position[1])) {
      map.setView(position, 16);
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [position, map]);
  return null;
}

export default function RoutingMap({ position, label }) {
  if (!position || isNaN(position[0]) || isNaN(position[1])) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Koordinat tidak valid
      </div>
    );
  }

  return (
    <MapContainer center={position} zoom={20} className="h-full w-full z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} icon={customIcon}>
        <Popup>{label}</Popup>
      </Marker>
      <RecenterMap position={position} />
    </MapContainer>
  );
}