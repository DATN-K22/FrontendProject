"use client";
import {
  Box,
  IconButton,
  Typography,
  Stack,
  Avatar,
  Button,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

export default function Header() {
  const router = useRouter();
  const { user, loading } = useUser();

  return (
    <Box
      component="header"
      sx={{
        color: "#000000",
        px: { xs: 2, md: 6 },
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button
          sx={{
            padding: "0.5em",
            borderRadius: "2em",
          }}
          onClick={() => router.replace("/")}
        >
          <Box
            component="img"
            src="/images/webLogo.png"
            alt="Web logo"
            sx={{
              height: "auto",
              width: "70%",
              objectFit: "contain",
            }}
          />
        </Button>

        <Box
          sx={{
            ml: { xs: 0, md: 3 },
            bgcolor: "#E6E6E6",
            borderRadius: { xs: 1, md: 2 },
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 0.5, md: 0.7 },
            display: "flex",
            alignItems: "center",
            width: { xs: 140, sm: 220, md: 320 },
          }}
        >
          <SearchIcon sx={{ color: "#000", mr: 1 }} />
          <InputBase
            placeholder="Search for courses"
            inputProps={{ "aria-label": "search" }}
            sx={{
              fontSize: { xs: "0.875rem", md: "1rem" },
              color: "#000",
              width: "100%",
            }}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        spacing={5}
        alignItems="center"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <Typography sx={{ color: "#5B5B5B" }}>Home</Typography>
        <Typography sx={{ color: "#5B5B5B" }}>My course</Typography>
        <Typography sx={{ color: "#5B5B5B" }}>Calender</Typography>
      </Stack>

      {/* Right: Wishlist + Profile */}
      {user ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton sx={{ color: "#5B5B5B" }}>
            <FavoriteBorderIcon />
          </IconButton>

          <Box>
            <Avatar sx={{ bgcolor: "#151312", width: 48, height: 48 }}></Avatar>
            <Typography>{}</Typography>
          </Box>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            onClick={() => router.push("/auth/register")}
            variant="contained"
            sx={{
              backgroundColor: "#fffacb",
              color: "#000",
              borderRadius: { xs: 4, md: 8 },
              py: { xs: 1, md: 1.25 },
              px: { xs: 2, md: 3 },
              minWidth: { xs: 90, md: 120 },
              fontWeight: 600,
              textTransform: "none",
              fontSize: { xs: "0.875rem", md: "1rem" },
              "&:hover": {
                backgroundColor: "#FFC700",
              },
            }}
          >
            Register
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push("/auth/login")}
            sx={{
              backgroundColor: "#FFD700",
              color: "#000",
              borderRadius: { xs: 4, md: 8 },
              py: { xs: 1, md: 1.25 },
              px: { xs: 2, md: 3 },
              minWidth: { xs: 90, md: 120 },
              fontWeight: 600,
              textTransform: "none",
              fontSize: { xs: "0.875rem", md: "1rem" },
              "&:hover": {
                backgroundColor: "#FFC700",
              },
            }}
          >
            Login
          </Button>
        </Stack>
      )}
    </Box>
  );
}
