import { Box, CircularProgress, Modal, Paper, Typography } from "@mui/material";
import { useSupabase } from "../hooks/useSupabase";
import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import Ride, { RideProps } from "./Ride";
import Loading from "./Loading";

export default function RidesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { supabase } = useSupabase();
  const { session } = useSession();
  const [rides, setRides] = useState<RideProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    async function fetchRides() {
      const { data } = await supabase.from("request").select("*");
      setLoading(false);
      if (data) {
        setRides(
          data.map((d) => ({
            pickupName: d.pickup_name,
            destinationName: d.destination_name,
            pickupTime: d.pickup_time,
          }))
        );
      }
    }

    fetchRides();
  }, [session?.user.id, supabase, open]);

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
          overflow: "hidden",
          width: {
            xs: "90%", // 90% of screen width on extra small screens
            sm: "70%", // 70% of screen width on small screens
            md: "50%", // 50% of screen width on medium screens
            lg: "40%", // 40% of screen width on large screens
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
            overflowY: "scroll",
            maxHeight: "100%",
            px: "1rem",
            py: "0.25rem",
          }}
        >
          {loading && <CircularProgress />}
          {rides.map((r) => (
            <Ride {...r} />
          ))}
        </Box>
      </Paper>
    </Modal>
  );
}
