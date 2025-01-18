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
        center: [longitude, latitude],
        zoom: 10.12,
      });

      mapRef.current.on("load", () => {
        setLoading(false);
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error.message);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    } else {
      console.error("Geolocation is not supported by this browser.");
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
            maxWidth: "350px", // Limit width for smaller screens
            width: "100%", // Full width on mobile
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#ffffff", // Log
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
      </div>
    );
  }
}

export default App;
