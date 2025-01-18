import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Box from "@mui/material/Box";
import polyline from "@mapbox/polyline";

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

  const routeData = {'code': 'Ok', 'waypoints': [{'distance': 3.0936280216618104, 'name': 'Mason Street', 'location': [-71.820344, 42.257245], 'waypoint_index': 0, 'trips_index': 0}, {'distance': 4.562927757566257, 'name': 'Dewey Street', 'location': [-71.820477, 42.259984], 'waypoint_index': 2, 'trips_index': 0}, {'distance': 2.4741999521940397, 'name': 'May Street', 'location': [-71.818592, 42.255932], 'waypoint_index': 3, 'trips_index': 0}, {'distance': 5.637111237354093, 'name': 'Ashland Street', 'location': [-71.807459, 42.263964], 'waypoint_index': 1, 'trips_index': 0}], 'trips': [{'geometry': 'yj|`GbljuLee@kRcCy\\^g^SAuGg@qErcAt]fNh@aDbGxB~R|HhDwTiBpL}CsA', 'legs': [{'steps': [], 'summary': '', 'weight': 360.9, 'duration': 300.9, 'distance': 1550.6}, {'steps': [], 'summary': '', 'weight': 545.6, 'duration': 397.4, 'distance': 1871.4}, {'steps': [], 'summary': '', 'weight': 161.8, 'duration': 119, 'distance': 681.5}, {'steps': [], 'summary': '', 'weight': 51, 'duration': 36.4, 'distance': 281.4}], 'weight_name': 'routability', 'weight': 1119.3, 'duration': 853.6999999999999, 'distance': 4384.9}]};
  
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_PUBLIC_KEY;

    const handleSuccess = (position: { coords: { latitude: number; longitude: number } }) => {
      const { latitude, longitude } = position.coords;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude, latitude],
        zoom: 10.12,
      });

      //geolocation controls
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");
      mapRef.current.addControl(geolocateControl, "bottom-right");
      // mapRef.current.addControl(geolocateControl);
      // mapRef.current.addControl(new mapboxgl.NavigationControl());
      

      mapRef.current.on("load", () => {
        setLoading(false);
        geolocateControl.trigger();

        //route
        const coordinates = polyline.decode(routeData.trips[0].geometry).map(([lat, lng]) => [lng, lat]);
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
          flexDirection: "column",
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
        <PullUpDrawer />
      </div>
    );
  }
}

export default App;
