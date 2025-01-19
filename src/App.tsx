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

  const handleLogoutClicked = async () => {
    handleMenuClose();
    await supabase.auth.signOut();
    window.location.reload();
  };

  const [isRidesOpen, setIsRidesOpen] = useState(false);

  const [routeData, setRouteData] = useState<any | null>(null);

  //update the map whenever routeData changes
  useEffect(() => {
    if (!routeData || !mapRef.current) return;

    const map = mapRef.current;

    //route geometry into coords
    const coordinates = polyline
      .decode(routeData.trips[0].geometry)
      .map(([lat, lng]) => [lng, lat]);

    //delete existing route
    if (map.getSource("route")) {
      map.removeLayer("route");
      map.removeSource("route");
    }

    // add route
    map.addSource("route", {
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

    map.addLayer({
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

    //waypoints
    routeData.waypoints.forEach((waypoint: any) => {
      new mapboxgl.Marker()
        .setLngLat(waypoint.location as [number, number])
        .setPopup(new mapboxgl.Popup().setText(waypoint.name || "Waypoint"))
        .addTo(map);
    });
  }, [routeData]);

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

      //controls
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

      mapRef.current.on("load", () => {
        setLoading(false);
        geolocateControl.trigger();
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

  useEffect(() => {
    if (session?.user.user_metadata.role !== "driver") return;

    const updateLocationId = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          await supabase
            .from("drivers")
            .update({ location: `POINT(${longitude} ${latitude})` })
            .eq("driver_id", session.user.id);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }, 5000);

    const updateRouteId = setInterval(async () => {
      if (routeData) return;
      const { data } = await supabase.rpc("get_nearest_route", {
        p_driver_id: session.user.id,
      });
      if (data.length > 0) {
        console.log(data);
        await supabase
          .from("route")
          .update({ assigned_driver_id: session.user.id })
          .eq("id", data[0].route_id);
      }
      data[0].route.id = data[0].route_id;
      setRouteData(data[0].route);
    }, 15000);

    return () => {
      clearInterval(updateLocationId);
      clearInterval(updateRouteId);
    };
  }, [routeData, session, supabase]);

  useEffect(() => {
    console.log(routeData);
  }, [routeData]);

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
          {session?.user.user_metadata.role !== "driver" && (
            <MenuItem onClick={handleRidesClicked}>My Rides</MenuItem>
          )}{" "}
          <MenuItem onClick={handleLogoutClicked}>Logout</MenuItem>
        </Menu>

        <PullUpDrawer setRouteData={setRouteData} routeData={routeData} />
        <RidesModal
          setOpen={setIsRidesOpen}
          open={isRidesOpen}
          onClose={() => setIsRidesOpen(false)}
          setRouteData={setRouteData}
        />
      </div>
    );
  }
}

export default App;
