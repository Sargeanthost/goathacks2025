import React, { useState } from "react";
import {
  Button,
  Box,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { useSupabase } from "../hooks/useSupabase";
import { SearchBox } from "@mapbox/search-js-react";
import { FormLabel } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import {
  DateTimeField,
  DateTimePicker,
  MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { NumberInput } from "@mui/base/Unstable_NumberInput/NumberInput";
import { useSession } from "../hooks/useSession";

const PickupForm = () => {
  const { supabase } = useSupabase();
  const { session } = useSession();

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [time, setTime] = useState<Dayjs | null>(dayjs());

  const [vehicleType, setVehicleType] = useState("eco-friendly");
  const [peopleTransferred, setPeopleTransferred] = useState(1);
  const [rideShare, setRideShare] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(pickup);
    const pickupCoordinates = pickup.features[0].geometry.coordinates;
    const destinationCoordinates = destination.features[0].geometry.coordinates;
    const pickupName = pickup.features[0].properties.name;
    const destinationName = destination.features[0].properties.name;
    console.log(pickupName);
    const { data, error } = await supabase.from("request").insert({
      pickup: `POINT(${pickupCoordinates[0]} ${pickupCoordinates[1]})`,
      destination: `POINT(${destinationCoordinates[0]} ${destinationCoordinates[1]})`,
      arrival: time?.toISOString(),
      vehicle_type: vehicleType,
      people_transferred: peopleTransferred,
      ride_share: rideShare,
      requester: session?.user.id,
      pickup_name: pickupName,
      destination_name: destinationName,
    });

    console.log(data);
    console.log(error);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        margin: "0 auto",
        padding: 2,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        boxShadow: 3,
        minWidth: {
          xs: "20rem", // Smaller screens
          sm: "30rem", // Medium screens
          md: "35rem", // Larger screens
        },
        width: "80%", // Allow it to shrink and grow with the container
        maxWidth: "100vw", // Prevent overflow
      }}
    >
      <Typography variant="h5">Let's find a whip 😎</Typography>

      <FormLabel>
        Pickup
        <SearchBox
          onRetrieve={(l) => setPickup(l)}
          accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_KEY}
        />
      </FormLabel>
      <FormLabel>
        Destination
        <SearchBox
          onRetrieve={(l) => setDestination(l)}
          accessToken={import.meta.env.VITE_MAPBOX_PUBLIC_KEY}
        />
      </FormLabel>
      <MobileDateTimePicker
        label="Time"
        value={time}
        onChange={(t) => setTime(t)}
      />
      <FormControl fullWidth>
        <InputLabel id="vehicle-type">Vehicle Type</InputLabel>
        <Select
          labelId="vehicle-type"
          label="Vehicle Type"
          defaultValue="eco-friendly"
          onChange={(t) => setVehicleType(t.target.value)}
        >
          <MenuItem value={"eco-friendly"}>Eco-Friendly</MenuItem>
          <MenuItem value={"economy"}>Economy</MenuItem>
          <MenuItem value={"luxury"}>Luxury</MenuItem>
        </Select>
      </FormControl>
      <TextField
        id="outlined-number"
        label="Passengers"
        type="number"
        value={peopleTransferred}
        onChange={(p) => setPeopleTransferred(p.target.value)}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            defaultChecked={true}
            value={rideShare}
            onChange={(a) => setRideShare(a.target.checked)}
          />
        }
        label="Allow ride share"
      />
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </Box>
  );
};

export default PickupForm;
