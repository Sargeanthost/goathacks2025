import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import polyline from "@mapbox/polyline";

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

  const routeData = {"code":"Ok","waypoints":[{"distance":2.7237214779669503,"name":"Gardner Street","location":[-71.814507,42.248807],"waypoint_index":0,"trips_index":0},{"distance":5.010421148407513,"name":"Tuckerman Street","location":[-71.80151,42.272547],"waypoint_index":3,"trips_index":0},{"distance":3.698813944183319,"name":"Thomas Street","location":[-71.800246,42.267923],"waypoint_index":1,"trips_index":0},{"distance":5.010421148407513,"name":"Tuckerman Street","location":[-71.80151,42.272547],"waypoint_index":2,"trips_index":0}],"trips":[{"geometry":"avz`GtgiuLyOcZbBcGsZkReYik@gJ{L_GQwFzGeW|AWlKy@fNcZkF??","legs":[{"steps":[],"summary":"","weight":718,"duration":574.1,"distance":3095.5},{"steps":[],"summary":"","weight":199.5,"duration":150,"distance":696.8},{"steps":[],"summary":"","weight":0,"duration":0,"distance":0}],"weight_name":"routability","weight":917.5,"duration":724.1,"distance":3792.3}]};

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

      //geolocation controls
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });

      mapRef.current.addControl(
        new mapboxgl.NavigationControl(),
        "bottom-right"
      );
      mapRef.current.addControl(geolocateControl, "bottom-right");
      // mapRef.current.addControl(geolocateControl);
      // mapRef.current.addControl(new mapboxgl.NavigationControl());

      mapRef.current.on("load", () => {
        setLoading(false);
        geolocateControl.trigger();

        //route
        const coordinates = polyline
          .decode(routeData.trips[0].geometry)
          .map(([lat, lng]) => [lng, lat]);
        mapRef.current?.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates,
            },
            properties: {},
          },
        });

        // add route
        mapRef.current?.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b9ddd",
            "line-width": 4,
          },
        });

        // add waypoints
        routeData.waypoints.forEach((waypoint) => {
          new mapboxgl.Marker()
            .setLngLat(waypoint.location as [number, number])
            .setPopup(new mapboxgl.Popup().setText(waypoint.name || "Waypoint"))
            .addTo(mapRef.current!);
        });
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error("Geolocation error:", error.message);
      setLoading(false);
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
          sx={{ position: "absolute", top: 0, right: 0, width: 80, height: 80 }}
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
        <RidesModal
          setOpen={setIsRidesOpen}
          open={isRidesOpen}
          onClose={() => setIsRidesOpen(false)}
        />
      </div>
    );
  }
}

export default App;
