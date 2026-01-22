import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";

/* ---- Leaflet icon fix (unchanged) ---- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/**
 * FlyController
 * (unchanged)
 */
function FlyController({ defaultCenter, defaultZoom }) {
  const map = useMap();
  const lastUserActionRef = React.useRef(Date.now());

  // Track any user interaction so we don't override their zoom
  useMapEvents({
    zoomstart() {
      lastUserActionRef.current = Date.now();
    },
    movestart() {
      lastUserActionRef.current = Date.now();
    },
    dragstart() {
      lastUserActionRef.current = Date.now();
    },
  });

  React.useEffect(() => {
    const onFlyTo = (e) => {
      const { lat, lon, zoom } = e.detail || {};
      if (lat == null || lon == null) return;

      // This is a programmatic move, not a user one, but we should still
      // prevent immediate "idle reset" afterwards:
      lastUserActionRef.current = Date.now();

      map.flyTo([lat, lon], zoom ?? map.getZoom(), {
        animate: true,
        duration: 0.8,
      });
    };

    window.addEventListener("itinex-flyto", onFlyTo);

    const IDLE_MS = 15000; // <-- change: how long before auto-reset (e.g. 15s)
    const tick = setInterval(() => {
      const now = Date.now();

      // Don't reset if the user recently interacted or clicked a marker
      if (window.__itinexRecentClick) return;
      if (now - lastUserActionRef.current < IDLE_MS) return;

      map.flyTo(defaultCenter, defaultZoom, {
        animate: true,
        duration: 0.9,
      });
    }, 1000);

    return () => {
      window.removeEventListener("itinex-flyto", onFlyTo);
      clearInterval(tick);
    };
  }, [map, defaultCenter, defaultZoom]);

  return null;
}

/**
 * DestinationMap
 * (unchanged)
 */
export default function DestinationMap({
  destinations,
  onSelect,
  getDestCondition,
  loadingMapWeather,
}) {
  const defaultCenter = [20, 0];
  const defaultZoom = 2;

  const makeWeatherIcon = (condition) => {
    const color =
      condition === "sunny"
        ? "#F59E0B"
        : condition === "rainy"
        ? "#3B82F6"
        : "#64748B";

    return L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;
          height:18px;
          border-radius:999px;
          background:${color};
          border:2px solid white;
          box-shadow:0 6px 14px rgba(0,0,0,0.25);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  return (
    <div className="w-full h-full relative">
      {loadingMapWeather && (
        <div className="absolute top-3 left-3 z-[1000] px-3 py-2 rounded-lg bg-white/90 backdrop-blur border shadow text-sm">
          Loading weather…
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyController
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        />

        {destinations.map((dest) => {
          const condition = getDestCondition(dest.id);
          const icon = makeWeatherIcon(condition);

          return (
            <Marker
              key={dest.id}
              position={[dest.lat, dest.lon]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  window.__itinexRecentClick = true;
                  setTimeout(() => (window.__itinexRecentClick = false), 1200);

                  window.dispatchEvent(
                    new CustomEvent("itinex-flyto", {
                      detail: { lat: dest.lat, lon: dest.lon, zoom: 9 },
                    })
                  );

                  setTimeout(() => onSelect(dest), 450);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="text-sm font-semibold">{dest.name}</div>
                <div className="text-xs text-gray-500">
                  {dest.country} • {condition}
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
