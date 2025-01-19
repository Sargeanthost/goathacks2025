import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

function DirectionsList({ legList }: { legList: any }) {
  // if (!routeData || !routeData.trips || routeData.trips.length === 0) {
  //     console.log("NO ROUTE DATA");
  //   return <div>No route available</div>;
  // }

  // const steps = routeData.trips[0].legs.flatMap((leg: any) => leg.steps);

  // instructions.innerHTM

  console.log(legList);

  return (
    <Box
      sx={{
        top: 80,
        left: 10,
        width: "300px",
        backgroundColor: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
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
    </Box>
  );
}

export default DirectionsList;
