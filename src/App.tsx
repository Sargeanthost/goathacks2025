import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import "./App.css";

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoicmtvZmZzdGVpbiIsImEiOiJjbTYxaDgxb2wwb3doMmxvdXpwdTlreHNuIn0.H3E6TEudUPiJzn3ZqTSYYg";

    let longitude = -71.8023;
    let latitude = 42.26253;

    const success = (position: {
      coords: { latitude: number; longitude: number };
    }) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    };

    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(success);

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      center: [longitude, latitude],
      zoom: 10.12,
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div id="map-container" ref={mapContainerRef} />
    </>
  );
}

export default App;
