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

  useEffect(() => {
    console.log(session);
  }, [session]);

  useEffect(() => {
    console.log(supabase);
  }, [supabase]);

  if (!session) {
    return (<Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />)
  } else {
    return (
      <Box sx={{ position: "relative", width: "100%", height: "100vh" }}>
        <div
          id="map-container"
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%", visibility: !loading ? "visible" : "hidden" }}
        />

        {loading && (
          <Loading />
        )}
      </Box>
    );
  }
}

export default App;
