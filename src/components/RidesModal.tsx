import { Box, CircularProgress, Modal, Paper, Typography } from "@mui/material";
import { useSupabase } from "../hooks/useSupabase";
import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import Ride, { RideProps } from "./Ride";
import Loading from "./Loading";
import polyline from "@mapbox/polyline";

export default function RidesModal({
  open,
  setOpen,
  onClose,
  setRouteData,
  clearRoutes,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onClose: () => void;
  setRouteData: (routeData: any) => void;
  clearRouteData: any;
}) {
  const { supabase } = useSupabase();
  const { session } = useSession();
  const [rides, setRides] = useState<RideProps[]>([]);
  const [loading, setLoading] = useState(true);
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_PUBLIC_KEY;

  useEffect(() => {
    if (!open) return;
    async function fetchRides() {
      const { error, data } = await supabase.rpc("get_all_requests");
      setLoading(false);
      if (data) {
        setRides(
          data.map((d) => ({
            pickupName: d.pickup_name,
            destinationName: d.destination_name,
            pickupTime:
              isValidDate(d.pickup_time) && d.pickup_time !== null
                ? new Date(d.pickup_time)
                : null,
            arrival: isValidDate(d.arrival) ? new Date(d.arrival) : null,
            destination: [d.destination_longitude, d.destination_latitude],
            pickup: [d.pickup_longitude, d.pickup_latitude],
            rideShare: d.ride_share,
            vehicleType: d.vehicle_type,
            estimatedPickupTime: isValidDate(d.estimated_pickup_time)
              ? new Date(d.estimated_pickup_time)
              : null,
            routeId: d.route_id,
            reqester: d.requester,
          }))
        );
      } else {
        console.error("Error fetching rides:", error);
      }
    }

    fetchRides();
  }, [session?.user.id, supabase, open]);

  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleRideClick = async (ride: RideProps) => {
    clearRoutes();
    if (ride.routeId === null) {
      try {
        const coordinates = `${ride.pickup[0]},${ride.pickup[1]};${ride.destination[0]},${ride.destination[1]}`;
        const apiUrl = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates}?source=first&destination=last&roundtrip=false&access_token=${mapboxAccessToken}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch route: ${response.statusText}`);
        }

        const routeDataModal = await response.json();
        console.log("Route Data:", routeDataModal);

        if (routeDataModal.code === "Ok") {
          setRouteData(routeDataModal);

          setOpen(false);
        } else {
          console.error(
            "Error in route optimization response:",
            routeDataModal.message
          );
        }
      } catch (error) {
        console.error("Error fetching route data:", error);
      }
    } else {
      const { data, error } = await supabase
        .from("route")
        .select("route")
        .eq("id", ride.routeId);

      if (error) {
        console.error("Error:", error);
      } else {
        console.log("Data:", data);

        if (data[0].route.code === "Ok") {
          setRouteData(data[0].route);

          setOpen(false);
        } else {
          console.error(
            "Error in route optimization response:",
            data[0].route.message
          );
        }
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          padding: "1rem",
          height: "60%",
          overflowY: "scroll",
          width: {
            xs: "90%", // 90% of screen width on extra small screens
            sm: "70%", // 70% of screen width on small screens
            md: "40%", // 50% of screen width on medium screens
            lg: "30%", // 40% of screen width on large screens
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography id="modal-modal-title" variant="h4" component="h2">
          My Rides
        </Typography>
        <Box
          sx={{
            maxHeight: "100%",
            px: "1rem",
            py: "0.25rem",
          }}
        >
          {loading && <CircularProgress />}
          {rides.map((r, index) => (
            <div
              key={index}
              onClick={() => handleRideClick(r)}
              style={{ cursor: "pointer" }}
              aria-roledescription="button"
            >
              <Ride {...r} />
            </div>
          ))}
        </Box>
      </Paper>
    </Modal>
  );
}
