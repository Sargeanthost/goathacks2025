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
  return <DirectionsList legList={legList} />;
}
