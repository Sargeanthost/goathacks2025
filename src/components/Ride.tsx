import { Card, CardContent, Typography, Box, Icon } from "@mui/material";
import EastIcon from "@mui/icons-material/East";

export interface RideProps {
  pickupName: string;
  destinationName: string;
  pickupTime: Date;
}

export default function Ride({
  pickupName,
  destinationName,
  pickupTime,
}: RideProps) {
  return (
    <Card elevation={4} sx={{ mt: "0.75rem" }}>
      <CardContent>
        <Typography variant="h6" component="div">
          Ride Request
        </Typography>
        <Box mt={2}>
          <Box sx={{ display: "flex", gap: "1rem", alignITems: "center" }}>
            <Typography variant="body1">{pickupName}</Typography>
            <Icon sx={{ mb: -3 }}>
              <EastIcon></EastIcon>
            </Icon>
            <Typography variant="body1">{destinationName}</Typography>
          </Box>
          {/* <Typography variant="body2" color="textSecondary">
            Pickup Time: {pickupTime.toLocaleString()}
          </Typography> */}
        </Box>
      </CardContent>
    </Card>
  );
}
