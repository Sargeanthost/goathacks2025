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
import DirectionsList from "./components/DirectionsList";

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { session } = useSession();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_PUBLIC_KEY;

  // var directionsData:Object[] = [];
  const [directionsData, setDirectionsData] = useState<any | null | Object[]>(
    null
  );

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

  const waypointMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const clearRoutes = () => {
    if (mapRef.current) {
      const map = mapRef.current;

      // Remove route layer and source if they exist
      if (map.getLayer("route")) {
        map.removeLayer("route");
      }
      if (map.getSource("route")) {
        map.removeSource("route");
      }

      // Remove all waypoint markers
      waypointMarkersRef.current.forEach((marker) => marker.remove());
      waypointMarkersRef.current = []; // Reset the reference

      console.log("Routes and waypoints cleared from the map.");
    }
  };

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
      const marker = new mapboxgl.Marker()
        .setLngLat(waypoint.location as [number, number])
        .setPopup(new mapboxgl.Popup().setText(waypoint.name || "Waypoint"))
        .addTo(map);

      waypointMarkersRef.current.push(marker);
    });
  }, [routeData]);

  useEffect(() => {
    if (!session) return;
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
        showAccuracyCircle: false,
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
  }, [session]);

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
      const steps = data.routes[0].legs.map((l) => l.steps);
      setDirectionsData(steps);
    }, 15000);

    return () => {
      clearInterval(updateLocationId);
      clearInterval(updateRouteId);
    };
  }, [session, supabase]);

  useEffect(() => {
    console.log(routeData);
  }, [routeData]);

  useEffect(() => {
    if (!routeData || !routeData.waypoints || routeData.waypoints.length === 0)
      return;

    const fetchRoute = async () => {
      try {
        // Order waypoints by "waypoint_index"
        const orderedWaypoints = routeData.waypoints.sort(
          (a: { waypoint_index: number }, b: { waypoint_index: number }) =>
            a.waypoint_index - b.waypoint_index
        );

        // Build coordinates string from ordered waypoints
        const coordinates = orderedWaypoints
          .map((waypoint: { location: [string, string] }) =>
            waypoint.location.join(",")
          )
          .join(";");

        // Mapbox API URL
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=polyline&steps=true&overview=full&access_token=${mapboxAccessToken}`;

        // Fetch route data
        const response = await fetch(url);
        const data = await response.json();
        console.log("Reponse:", data);

        // Pass the fetched data to DirectionsList
        if (data.code === "Ok") {
          // directionsData = data.routes[0].legs[0].steps;
          console.log("LEGS: " + data.routes[0].legs);
          const steps = data.routes[0].legs.map((l) => l.steps);
          setDirectionsData(steps);
        } else {
          console.error("Error in API response:", data.message);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [mapboxAccessToken, routeData, routeData?.waypoints]);

  // console.log("Directions Data:", directionsData);

  useEffect(() => {
    if (!routeData || !routeData.waypoints || routeData.waypoints.length === 0)
      return;

    const fetchRoute = async () => {
      try {
        // Order waypoints by "waypoint_index"
        const orderedWaypoints = routeData.waypoints.sort(
          (a: { waypoint_index: number }, b: { waypoint_index: number }) =>
            a.waypoint_index - b.waypoint_index
        );

        // Build coordinates string from ordered waypoints
        const coordinates = orderedWaypoints
          .map((waypoint: { location: [string, string] }) =>
            waypoint.location.join(",")
          )
          .join(";");

        // Mapbox API URL
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=polyline&steps=true&overview=full&access_token=${mapboxAccessToken}`;

        // Fetch route data
        const response = await fetch(url);
        const data = await response.json();
        console.log("Reponse:", data);

        // Pass the fetched data to DirectionsList
        if (data.code === "Ok") {
          // directionsData = data.routes[0].legs[0].steps;
          setDirectionsData(data.routes[0].legs);
        } else {
          console.error("Error in API response:", data.message);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [mapboxAccessToken, routeData, routeData?.waypoints]);

  // console.log("Directions Data:", directionsData);

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

        <PullUpDrawer
          setRouteData={setRouteData}
          routeData={routeData}
          legList={directionsData}
          clearRoutes={clearRoutes}
        />
        <RidesModal
          clearRoutes={clearRoutes}
          setOpen={setIsRidesOpen}
          open={isRidesOpen}
          onClose={() => setIsRidesOpen(false)}
          setRouteData={setRouteData}
        />

        {/* {directionsData && <DirectionsList legList={directionsData} />} */}
      </div>
    );
  }
}

export default App;
