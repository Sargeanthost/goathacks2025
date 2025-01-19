import { Box, Button, Typography } from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useSupabase } from "../hooks/useSupabase";
import DirectionsList from "./DirectionsList";

export default function Routes({
  routeData,
  setRouteData,
  legList,
}: {
  routeData: any;
  setRouteData: (routeData: null | any) => void;
  legList: any;
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
      <DirectionsList legList={legList} />
    </Box>
  );
}
