// Shared MUI sx styles for TextField with yellow border
export const yellowTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 4, md: 8 },
    fontSize: { xs: "0.875rem", md: "1rem" },
    "& fieldset": {
      borderColor: "#FFD700",
      borderWidth: 2,
    },
    "&:hover fieldset": {
      borderColor: "#FFD700",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#FFD700",
    },
    "& .MuiOutlinedInput-input": {
      py: { xs: 1.5, md: 2 },
      px: { xs: 2, md: 3 },
    },
  },
};

// Shared tab button sx generator
export const tabButtonSx = (isActive: boolean) => ({
  borderRadius: { xs: 4, md: 8 },
  flex: 1,
  backgroundColor: isActive ? "#FFD700" : "transparent",
  color: "#000",
  textTransform: "none" as const,
  fontWeight: 600,
  py: { xs: 1, md: 1.5 },
  fontSize: { xs: "0.875rem", md: "1rem" },
  "&:hover": {
    backgroundColor: isActive ? "#FFD700" : "rgba(255, 215, 0, 0.1)",
  },
});
