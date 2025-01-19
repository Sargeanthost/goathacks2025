import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export default function RouteOverlay() {
  return (
    <Paper
      sx={{
        maxWidth: "60rem",
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        right: 0,
        padding: 2,
        boxShadow: 3,
        backgroundColor: "background.paper",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1300,
      }}
    >
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        Current Route
      </Typography>
    </Paper>
  );
}
