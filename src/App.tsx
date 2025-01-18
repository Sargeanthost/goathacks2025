import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Box from "@mui/material/Box";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import Loading from "./components/Loading";
import { useSupabase } from "./hooks/useSupabase";
import { useSession } from "./hooks/useSession";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import PullUpDrawer from "./components/PullUpDrawer";

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { session } = useSession();

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_KEY;

    const handleSuccess = (position: {
      coords: { latitude: number; longitude: number };
    }) => {
      const { latitude, longitude } = position.coords;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 10.12,
      });

      // geolocation control
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });
      mapRef.current.addControl(geolocateControl);
      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // get user location
      mapRef.current.on("load", () => {
        setLoading(false);
        geolocateControl.trigger();
      });
    };

    // error
    const handleError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error.message);
      setLoading(false);
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-74.006, 40.7128], // New York City coordinates
        zoom: 10,
      });

      mapRef.current.on("load", () => {
        setLoading(false);
      });
    };

    // supported?
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      console.error("Geolocation is not supported by this browser.");
      handleError({
        code: 0,
        message: "Geolocation not supported.",
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5", // Behind login box
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "400px", // Limit width for smaller screens
            width: "90%", // Full width on mobile
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#ffffff", // Login box color
          }}
        >
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
      </div>
    );
  } else {
    // Map
    return (
      <div>
        <Box className="map-box">
          <div
            className="map-container"
            ref={mapContainerRef}
            style={{
              visibility: !loading ? "visible" : "hidden",
              height: "100vh",
            }}
          />
          {loading && <Loading />}
        </Box>
        <PullUpDrawer />
      </div>
    );
  }
}

export default App;
