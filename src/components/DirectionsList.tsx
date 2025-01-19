import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import { useSupabase } from "../hooks/useSupabase";

function DirectionsList({
  legList,
  setRouteData,
  routeData,
}: {
  legList: any;
  setRouteData: any;
  routeData: any;
}) {
  // if (!routeData || !routeData.trips || routeData.trips.length === 0) {
  //     console.log("NO ROUTE DATA");
  //   return <div>No route available</div>;
  // }

  // const steps = routeData.trips[0].legs.flatMap((leg: any) => leg.steps);

  // instructions.innerHTM

  console.log(legList);

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
        top: 80,
        left: 10,
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        maxHeight: 400,
        overflowY: "scroll",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Directions
      </Typography>
      {legList.map((stepsList, index) => (
        <>
          <Typography variant="h6">Stop {index}</Typography>
          <List>
            {stepsList.steps.map((step: any, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={step.maneuver.instruction}
                    secondary={`Distance: ${(step.distance / 1000).toFixed(
                      2
                    )} km`}
                  />
                </ListItem>
                {index < stepsList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </>
      ))}
      <Button variant="contained" onClick={endRoute}>
        End route
      </Button>
    </Box>
  );
}

export default DirectionsList;
