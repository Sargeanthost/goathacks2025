import { Box, Button, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSupabase } from "../hooks/useSupabase";

export default function Routes({
  routeData,
  setRouteData,
}: {
  routeData: any;
  setRouteData: (routeData: null | any) => void;
}) {
  // Example route data
  const route = {
    pickup: "123 Main St, Cityville",
    destination: "456 Oak St, Townsville",
    arrivalTime: "5:30 PM",
  };

  const { supabase } = useSupabase();

  async function endRoute() {
    console.log(routeData);
    if (!routeData) return;
    await supabase
      .from("route")
      .update({ is_completed: true })
      .eq("id", routeData.id);
    setRouteData(null);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        margin: "0 auto",
        padding: 2,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5">Current Route</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PlaceIcon />
          <Typography variant="body1">{`Pickup: ${route.pickup}`}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PlaceIcon />
          <Typography variant="body1">{`Destination: ${route.destination}`}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccessTimeIcon />
          <Typography variant="body1">{`Arrival Time: ${route.arrivalTime}`}</Typography>
        </Box>
        <Button variant="contained" onClick={endRoute}>
          Complete Route
        </Button>
      </Box>
    </Box>
  );
}
