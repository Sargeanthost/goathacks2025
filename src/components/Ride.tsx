import { Card, CardContent, Typography, Box, Icon, Chip } from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import CarIcon from "@mui/icons-material/DirectionsCar"; // Icon for economy car
import LuxuryIcon from "@mui/icons-material/Star"; // Icon for luxury vehicles
import Diversity3Icon from "@mui/icons-material/Diversity3";
import { useEffect } from "react";

export interface RideProps {
  pickupName: string;
  destinationName: string;
  pickupTime: Date;
  arrival: Date;
  destination: number[];
  pickup: number[];
  rideShare: boolean;
  vehicleType: "economy" | "eco-friendly" | "luxury"; // Updated to represent actual vehicle types
  estimatedPickupTime: Date;
  routeId: string;
  requester: string;
}

export default function Ride(props: RideProps) {
  const getVehicleIcon = () => {
    switch (props.vehicleType) {
      case "eco-friendly":
        return <EnergySavingsLeafIcon sx={{ color: "green" }} />;
      case "economy":
        return <CarIcon sx={{ color: "blue" }} />;
      case "luxury":
        return <LuxuryIcon sx={{ color: "gold" }} />;
      default:
        return null;
    }
  };

  const getChipColor = () => {
    switch (props.vehicleType) {
      case "eco-friendly":
        return "success"; // Green color for eco-friendly
      case "economy":
        return "primary"; // Default color for economy
      case "luxury":
        return "warning"; // Yellow color for luxury
      default:
        return "default";
    }
  };

  useEffect(() => {
    console.log(props);
  }, [props]);

  return (
    <Card
      elevation={4}
      sx={{
        mt: "0.75rem",
        borderLeft: `4px solid ${props.pickupTime ? "green" : "yellow"}`,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" component="div">
            {props.estimatedPickupTime.toLocaleDateString()}
          </Typography>
          <Box sx={{ display: "flex", gap: "0.25rem" }}>
            <Chip
              label={
                props.vehicleType.charAt(0).toUpperCase() +
                props.vehicleType.slice(1)
              } // Capitalize the first letter of vehicle type
              color={getChipColor()}
              icon={getVehicleIcon()}
            />
            {/* Show shared ride indicator */}
            {props.rideShare && (
              <Chip
                label="Shared Ride"
                color="success"
                icon={<Diversity3Icon />}
              />
            )}
          </Box>
        </Box>
        <Box mt={2}>
          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="body1">{props.pickupName}</Typography>
              {
                <Chip
                  size="small"
                  label={
                    props.pickupTime
                      ? props.pickupTime?.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : props.estimatedPickupTime?.toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                  }
                  color={!props.pickupTime ? "warning" : "default"}
                />
              }
            </Box>
            <Icon>
              <EastIcon />
            </Icon>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="body1">{props.destinationName}</Typography>
              {
                <Chip
                  size="small"
                  label={
                    props.arrival
                      ? props.arrival.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "PENDING"
                  }
                  color={!props.arrival ? "warning" : "default"}
                />
              }
            </Box>{" "}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
