import React, { useState } from "react";
import { Drawer, IconButton, Box, Typography } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RequestForm from "./RequestForm";

const PullUpDrawer: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  return (
    <div>
      {/* Pull-up button */}
      {!isDrawerOpen && (
        <IconButton
          onClick={toggleDrawer(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1300, // Ensure it's above other content
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <ArrowDropUpIcon />
        </IconButton>
      )}

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            backgroundColor: "transparent", // Make the background transparent
            boxShadow: "none", // Remove the shadow
          },
        }}
      >
        {" "}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 2,
          }}
        >
          {/* Pull-up button inside the drawer */}
          <IconButton
            onClick={toggleDrawer(false)}
            sx={{
              alignSelf: "center",
              backgroundColor: "primary.main",
              color: "white",
              mb: 2,
            }}
          >
            <ArrowDropDownIcon />
          </IconButton>

          <RequestForm />
        </Box>
      </Drawer>
    </div>
  );
};

export default PullUpDrawer;
