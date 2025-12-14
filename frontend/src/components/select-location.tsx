import React, { useEffect, useRef, useState } from 'react';

// NOTE: This component prefers Google Maps if a Vite env var `VITE_GOOGLE_MAPS_API_KEY`
// is provided. If not present it falls back to Leaflet (no API key required).

// If you choose Leaflet, install these packages:
// npm install leaflet leaflet-draw
// npm install --save-dev @types/leaflet

// Leaflet CSS will be injected dynamically when the Leaflet fallback is used.

type Corner = { lat: number; lng: number };

export default function SelectLocation(): React.ReactElement {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnLayerRef = useRef<any>(null);
  const [corners, setCorners] = useState<Corner[] | null>(null);
  const mapboxApiKey = import.meta.env.VITE_MAPBOX_API_KEY as string | undefined;

  useEffect(() => {
    if (mapboxApiKey) {
      initMapbox();
    } else {
      // lazy import Leaflet to keep bundle small when Google is used
      initLeaflet();
    }

    // cleanup on unmount
    return () => {
      if (mapInstanceRef.current && mapInstanceRef.current.remove) {
        // Leaflet maps have remove(); google maps do not provide remove()
        try { mapInstanceRef.current.remove(); } catch (_) {}
      }
      mapInstanceRef.current = null;
      drawnLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Mapbox implementation (preferred when API key present) ----------
  const initMapbox = async () => {
    // inject CSS for mapbox and mapbox-gl-draw
    const mapboxCss = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    const drawCss = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.5.0/mapbox-gl-draw.css';
    if (!document.querySelector(`link[href="${mapboxCss}"]`)) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = mapboxCss;
      document.head.appendChild(l);
    }
    if (!document.querySelector(`link[href="${drawCss}"]`)) {
      const ld = document.createElement('link');
      ld.rel = 'stylesheet';
      ld.href = drawCss;
      document.head.appendChild(ld);
    }

    // load mapbox-gl and mapbox-gl-draw via global script if not present
    if (!(window as any).mapboxgl) {
      await loadScript('https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js');
    }
    if (!(window as any).MapboxDraw) {
      await loadScript('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.5.0/mapbox-gl-draw.js');
    }

    const mapboxgl = (window as any).mapboxgl;
    const MapboxDraw = (window as any).MapboxDraw;
    if (!mapboxgl || !MapboxDraw || !mapRef.current) return;

    mapboxgl.accessToken = mapboxApiKey;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [79.8612, 6.9271],
      zoom: 13,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'draw_polygon',
    });
    map.addControl(draw, 'top-left');

    map.on('draw.create', (e: any) => {
      const feat = e.features && e.features[0];
      if (feat) updateCornersFromGeoJSONFeature(feat);
    });

    map.on('draw.update', (e: any) => {
      const feat = e.features && e.features[0];
      if (feat) updateCornersFromGeoJSONFeature(feat);
    });

    mapInstanceRef.current = map;
    drawnLayerRef.current = null;
  };

  const updateCornersFromGeoJSONFeature = (feat: any) => {
    // Use first ring of polygon coordinates
    const coords = feat.geometry?.coordinates?.[0];
    if (!coords || coords.length === 0) return;

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    coords.forEach(([lng, lat]: [number, number]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const nw = { lat: maxLat, lng: minLng };
    const ne = { lat: maxLat, lng: maxLng };
    const se = { lat: minLat, lng: maxLng };
    const sw = { lat: minLat, lng: minLng };
    setCorners([nw, ne, se, sw]);
  };

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = (e) => reject(e);
    document.head.appendChild(el);
  });

  // ---------- Leaflet implementation (fallback) ----------
  const initLeaflet = async () => {
    // Inject Leaflet CSS from CDN if not already present
    const leafletCss = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    const leafletDrawCss = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
    if (!document.querySelector(`link[href="${leafletCss}"]`)) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = leafletCss;
      document.head.appendChild(l);
    }
    if (!document.querySelector(`link[href="${leafletDrawCss}"]`)) {
      const ld = document.createElement('link');
      ld.rel = 'stylesheet';
      ld.href = leafletDrawCss;
      document.head.appendChild(ld);
    }

    // Load Leaflet JS from CDN (avoids requiring `leaflet` package to be installed)
    if (!(window as any).L) {
      await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    }
    if (!(window as any).L || !(window as any).L.Control.Draw) {
      await loadScript('https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js');
    }

    const L = (window as any).L;

    if (!mapRef.current) return;
    const map = L.map(mapRef.current).setView([6.9271, 79.8612], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new (L as any).Control.Draw({
      draw: { polyline: false, polygon: false, circle: false, marker: false, circlemarker: false, rectangle: true },
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    map.on((L as any).Draw.Event.CREATED, function (e: any) {
      const layer = e.layer;
      // only keep one rectangle
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      drawnLayerRef.current = layer;
      const bounds = layer.getBounds();
      updateCornersFromLeafletBounds(bounds);
    });

    mapInstanceRef.current = map;
  };

  const updateCornersFromLeafletBounds = (bounds: any) => {
    const nw = bounds.getNorthWest();
    const ne = bounds.getNorthEast();
    const se = bounds.getSouthEast();
    const sw = bounds.getSouthWest();
    setCorners([ { lat: nw.lat, lng: nw.lng }, { lat: ne.lat, lng: ne.lng }, { lat: se.lat, lng: se.lng }, { lat: sw.lat, lng: sw.lng } ]);
  };

  const clearSelection = () => {
    // Google rectangle
    if ((window as any).google && drawnLayerRef.current && drawnLayerRef.current.setMap) {
      drawnLayerRef.current.setMap(null);
      drawnLayerRef.current = null;
    }
    // Leaflet rectangle
    if (mapInstanceRef.current && mapInstanceRef.current instanceof Object && (mapInstanceRef.current as any).removeLayer) {
      try {
        const map = mapInstanceRef.current as any;
        if (map && map.eachLayer) {
          // remove drawn layer if present
          if (drawnLayerRef.current && drawnLayerRef.current.remove) {
            drawnLayerRef.current.remove();
            drawnLayerRef.current = null;
          }
        }
      } catch (_) {}
    }
    setCorners(null);
  };

  return (
    <div className="select-location container py-3">
      <h3 className="mb-3">Select Location Area</h3>
      {mapboxApiKey ? (
        <div className="small text-muted mb-2">Using Mapbox (VITE_MAPBOX_API_KEY provided)</div>
      ) : (
        <div className="small text-muted mb-2">Using OpenStreetMap + Leaflet fallback (no API key required)</div>
      )}

      <div ref={mapRef} className="map-container mb-3" />

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={clearSelection}>Clear</button>
      </div>

      <div>
        <h6>Corners</h6>
        {!corners ? (
          <div className="text-muted">No area selected. Use the rectangle drawing tool on the map.</div>
        ) : (
          <ol>
            {corners.map((c, i) => (
              <li key={i} className="mb-1">{c.lat.toFixed(6)}, {c.lng.toFixed(6)}</li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
