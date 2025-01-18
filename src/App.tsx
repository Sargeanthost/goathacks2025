import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import Loading from "./components/Loading";
import { useSupabase } from "./hooks/useSupabase";
import { useSession } from "./hooks/useSession";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import PullUpDrawer from "./components/PullUpDrawer";
import RidesModal from "./components/RidesModal";

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { session } = useSession();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRidesClicked = () => {
    handleMenuClose();
    setIsRidesOpen(true);
  };

  const [isRidesOpen, setIsRidesOpen] = useState(false);

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

      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      mapRef.current.addControl(geolocateControl);
      mapRef.current.addControl(new mapboxgl.NavigationControl());

      mapRef.current.on("load", () => {
        setLoading(false);
        geolocateControl.trigger();
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error.message);
      setLoading(false);
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-74.006, 40.7128],
        zoom: 10,
      });

      mapRef.current.on("load", () => {
        setLoading(false);
      });
    };

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
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            width: "90%",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#ffffff",
          }}
        >
          <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
        </div>
      </div>
    );
  } else {
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
        <IconButton
          sx={{ position: "absolute", top: 0, left: 0, width: 80, height: 80 }}
          color="primary"
          onClick={handleMenuOpen}
        >
          <AccountCircleIcon sx={{ fontSize: 70 }} />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem onClick={handleRidesClicked}>My Rides</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>

        <PullUpDrawer />
        <RidesModal open={isRidesOpen} onClose={() => setIsRidesOpen(false)} />
      </div>
    );
  }
}

export default App;
