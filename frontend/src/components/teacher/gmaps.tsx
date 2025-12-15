import React, { useEffect, useRef, useState } from 'react';

type Corner = { lat: number; lng: number };

export default function GMaps(): React.ReactElement {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnRectRef = useRef<any>(null);
  const [corners, setCorners] = useState<Corner[] | null>(null);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    if (!googleApiKey) return;
    initGoogleMaps();

    return () => {
      // cleanup
      try {
        if (drawnRectRef.current) {
          drawnRectRef.current.setMap(null);
          drawnRectRef.current = null;
        }
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.defer = true;
    el.onload = () => resolve();
    el.onerror = (e) => reject(e);
    document.head.appendChild(el);
  });

  const initGoogleMaps = async () => {
    try {
      if (!(window as any).google) {
        const src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=drawing`;
        await loadScript(src);
      }

      const google = (window as any).google;
      if (!google || !mapRef.current) return;

      const center = { lat: 6.9271, lng: 79.8612 };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
      });

      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.RECTANGLE],
        },
        rectangleOptions: {
          editable: true,
        },
      });
      drawingManager.setMap(map);

      google.maps.event.addListener(drawingManager, 'rectanglecomplete', (rect: any) => {
        // remove previous
        if (drawnRectRef.current) drawnRectRef.current.setMap(null);
        drawnRectRef.current = rect;
        updateCornersFromRect(rect);
        rect.addListener('bounds_changed', () => updateCornersFromRect(rect));
      });

      mapInstanceRef.current = map;
    } catch (err) {
      // show nothing; user will see key missing message
      // console.warn('Google Maps failed to load', err);
    }
  };

  const updateCornersFromRect = (rect: any) => {
    const bounds = rect.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const nw = { lat: ne.lat(), lng: sw.lng() };
    const se = { lat: sw.lat(), lng: ne.lng() };
    setCorners([nw, { lat: ne.lat(), lng: ne.lng() }, se, { lat: sw.lat(), lng: sw.lng() }]);
  };

  const clearSelection = () => {
    if (drawnRectRef.current && drawnRectRef.current.setMap) {
      drawnRectRef.current.setMap(null);
      drawnRectRef.current = null;
    }
    setCorners(null);
  };

  return (
    <div className="select-location container py-3">
      <h3 className="mb-3">Select Location Area (Google Maps)</h3>
      {!googleApiKey ? (
        <div className="alert alert-warning">VITE_GOOGLE_MAPS_API_KEY is not set. Google Maps cannot load.</div>
      ) : (
        <div className="small text-muted mb-2">Using Google Maps Drawing API</div>
      )}

      <div ref={mapRef} className="map-container mb-3" />

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={clearSelection}>Clear</button>
      </div>

      <div>
        <h6>Corners</h6>
        {!corners ? (
          <div className="text-muted">No area selected. Use the rectangle tool on the map.</div>
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
