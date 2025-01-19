import React from "react";
import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";

function DirectionsList({ stepsList }: { stepsList: any }) {
    // if (!routeData || !routeData.trips || routeData.trips.length === 0) {
    //     console.log("NO ROUTE DATA");
    //   return <div>No route available</div>;
    // }
  
    // const steps = routeData.trips[0].legs.flatMap((leg: any) => leg.steps);
    console.log("Steps List:", stepsList);

    let tripInstructions = '';
    for (const step of stepsList) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
    }
    // instructions.innerHTM

    return (
        <Box
          sx={{
            position: "absolute",
            top: 80,
            left: 10,
            maxHeight: "50%",
            width: "300px",
            overflowY: "scroll",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Directions
          </Typography>
          <List>
            {stepsList.map((step: any, index: number) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={step.maneuver.instruction}
                    secondary={`Distance: ${(step.distance / 1000).toFixed(2)} km`}
                  />
                </ListItem>
                {index < stepsList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
    );
  }
  
  

export default DirectionsList;
