"use client";

import api from "@/api/api";
import { User } from "@/utils/dto/User";
import { useAlert } from "@/components/alert";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import { default as CameraIcon } from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

type FormErrors = {
  email?: string;
  old_password?: string;
  new_password?: string;
  first_name?: string;
  last_name?: string;
  confirm_password?: string;
};

// ─── Icons ─────────────────────────────────────────────────────────────────────
export const EyeIcon = ({ off }: { off?: boolean }) =>
  off ? <VisibilityOffIcon /> : <VisibilityIcon />;

// ─── Theme colors ──────────────────────────────────────────────────────────────
const C = {
  yellow: "#FFD700",
  yellowLight: "#FFE680",
  yellowDark: "#FFC700",
  cream: "#FAFAF5",
  white: "#FFFFFF",
  ink: "#1A1A1A",
  inkLight: "#555555",
  border: "#E8E4D4",
  error: "#E53E3E",
};

// ─── Shared input styles ───────────────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 4, md: 8 },
    fontSize: { xs: "0.875rem", md: "1rem" },
    "& fieldset": {
      borderColor: C.yellowDark,
      borderWidth: 2,
    },
    "&:hover fieldset": {
      borderColor: C.yellowDark,
    },
    "&.Mui-focused fieldset": {
      borderColor: C.yellowDark,
      borderWidth: 2,
    },
    "& .MuiOutlinedInput-input": {
      py: { xs: 1.5, md: 2 },
      px: { xs: 2, md: 3 },
    },
  },
};

const primaryBtn = {
  backgroundColor: "#FFD700",
  color: "#000",
  fontWeight: 600,
  textTransform: "none",
  borderRadius: { xs: 4, md: 8 },
  py: { xs: 1, md: 1.5 },
  px: 4,
  fontSize: { xs: "0.875rem", md: "1rem" },
  "&:hover": {
    backgroundColor: "#FFC700",
  },
  "&:disabled": { backgroundColor: "#E0E0E0", color: "#999" },
};

const ghostBtn = {
  border: `2px solid ${C.yellowDark}`,
  color: C.ink,
  fontWeight: 600,
  borderRadius: "50px",
  px: 4,
  py: 1.2,
  "&:hover": { background: C.yellowLight },
};

// ─── Avatar Upload Dialog ──────────────────────────────────────────────────────
function AvatarDialog({
  open,
  onClose,
  user,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
  onSuccess: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Maximum image size is 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await api.post(`/users/user/${user.id}/avatar`, form);
      onSuccess(res.data.data.avt_url);
      onClose();
    } catch {
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setFile(null);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 360 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 600, fontSize: "1.2rem", textAlign: "center" }}
      >
        Update Avatar
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            py: 1,
          }}
        >
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{
              position: "relative",
              cursor: "pointer",
              "&:hover .overlay": { opacity: 1 },
            }}
          >
            <Avatar
              src={preview || user.avt_url}
              sx={{
                width: 120,
                height: 120,
                border: `3px solid ${C.yellow}`,
                fontSize: "3rem",
              }}
            >
              {user.first_name[0]}
            </Avatar>
            <Box
              className="overlay"
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.45)",
                opacity: 0,
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <CameraIcon />
            </Box>
          </Box>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
          <Button
            variant="outlined"
            onClick={() => fileRef.current?.click()}
            sx={ghostBtn}
            size="small"
          >
            Choose Image
          </Button>
          {error && (
            <Alert severity="error" sx={{ width: "100%", borderRadius: 3 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClose}
              sx={ghostBtn}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleUpload}
              disabled={!file || loading}
              sx={primaryBtn}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: C.ink }} />
              ) : (
                "Save"
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Profile Dialog ───────────────────────────────────────────────────────
function EditProfileDialog({
  open,
  onClose,
  user,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  user: User;
  onSuccess: (firstName: string, lastName: string) => void;
}) {
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setError("");
      setSaved(false);
    }
  }, [open, user]);

  const handleClose = () => {
    setError("");
    setSaved(false);
    setErrors({});
    onClose();
  };

  const handleSave = async () => {
    const trimFirst = firstName.trim();
    const trimLast = lastName.trim();
    const newErrors: FormErrors = {};
    if (!trimFirst) {
      newErrors.first_name = "First name is required.";
      setErrors(newErrors);
      return;
    }

    if (!trimLast) {
      newErrors.last_name = "Last name is required.";
      setErrors(newErrors);
      return;
    }
    if (trimFirst.length < 2 || trimLast.length < 2) {
      newErrors.first_name = "First name must be at least 2 characters.";
      newErrors.last_name = "Last name must be at least 2 characters.";
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await api.patch(`/users/user/${user.id}`, {
        first_name: trimFirst,
        last_name: trimLast,
      });
      setFirstName(res.data.data.first_name);
      setLastName(res.data.data.last_name);
      setSaved(true);
      onSuccess(trimFirst, trimLast);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 600, fontSize: "1.2rem", textAlign: "center", pb: 0 }}
      >
        Edit Personal Information
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {saved ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                py: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: C.yellowLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${C.yellow}`,
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.yellowDark}
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  textAlign: "center",
                }}
              >
                Profile Updated!
              </Typography>
              <Typography
                sx={{
                  color: C.inkLight,
                  fontSize: "0.95rem",
                  textAlign: "center",
                }}
              >
                Your personal information has been saved successfully.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleClose}
                sx={primaryBtn}
              >
                Close
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  First Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your first name"
                  value={firstName}
                  error={!!errors.first_name}
                  helperText={errors.first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={inputSx}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: { xs: "0.875rem", md: "1rem" },
                  }}
                >
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your last name"
                  value={lastName}
                  error={!!errors.last_name}
                  helperText={errors.last_name}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={inputSx}
                  inputProps={{ maxLength: 50 }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ gap: 2, mt: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{ ...primaryBtn, mb: 1 }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: C.ink }} />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClose}
                  sx={ghostBtn}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Change Password Dialog ────────────────────────────────────────────────────
type PwStep = "form" | "success";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

function ChangePasswordDialog({
  open,
  onClose,
  userId,
}: ChangePasswordDialogProps) {
  const [step, setStep] = useState<PwStep>("form");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const reset = () => {
    setStep("form");
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    setError("");
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmitPw = async () => {
    const newErrors: FormErrors = {};

    if (!oldPw) {
      newErrors.old_password = "Current password is required.";
    }
    if (!newPw) {
      newErrors.new_password = "New password is required.";
    } else if (newPw.length < 8) {
      newErrors.new_password = "New password must be at least 8 characters.";
    }
    if (!confirmPw) {
      newErrors.confirm_password = "Please confirm your new password.";
    } else if (newPw && newPw !== confirmPw) {
      newErrors.confirm_password =
        "New password and confirmation do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.patch(`/users/user/${userId}/password`, {
        current_password: oldPw,
        new_password: newPw,
      });
      setStep("success");
    } catch (e: any) {
      setError(
        "Fail to update password. Please check your current password and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    label: string;
    errorKey: keyof FormErrors;
    show: boolean;
    setShow: (v: boolean) => void;
    val: string;
    setVal: (v: string) => void;
    placeholder: string;
  }[] = [
    {
      label: "Current Password",
      errorKey: "old_password",
      show: showOld,
      setShow: setShowOld,
      val: oldPw,
      setVal: setOldPw,
      placeholder: "Enter your current password",
    },
    {
      label: "New Password",
      errorKey: "new_password",
      show: showNew,
      setShow: setShowNew,
      val: newPw,
      setVal: setNewPw,
      placeholder: "Enter your new password",
    },
    {
      label: "Confirm New Password",
      errorKey: "confirm_password",
      show: showConfirm,
      setShow: setShowConfirm,
      val: confirmPw,
      setVal: setConfirmPw,
      placeholder: "Confirm your new password",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 400 } }}
    >
      <DialogTitle
        sx={{ fontWeight: 600, fontSize: "1.2rem", textAlign: "center", pb: 0 }}
      >
        Change Password
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {step === "form" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {fields.map((field) => (
                <Box key={field.errorKey}>
                  <Typography
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    }}
                  >
                    {field.label}
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder={field.placeholder}
                    type={field.show ? "text" : "password"}
                    value={field.val}
                    error={!!errors[field.errorKey]}
                    helperText={errors[field.errorKey]}
                    onChange={(e) => {
                      field.setVal(e.target.value);
                      if (errors[field.errorKey]) {
                        setErrors((prev) => ({
                          ...prev,
                          [field.errorKey]: undefined,
                        }));
                      }
                    }}
                    sx={inputSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => field.setShow(!field.show)}
                            size="small"
                          >
                            <EyeIcon off={!field.show} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              ))}

              {error && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmitPw}
                disabled={loading}
                sx={{ ...primaryBtn, mt: 1 }}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: C.ink }} />
                ) : (
                  "Change Password"
                )}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClose}
                sx={ghostBtn}
              >
                Cancel
              </Button>
              <Box sx={{ textAlign: "center" }}>
                <Button
                  variant="text"
                  onClick={() => router.replace("/auth/forgot-password")}
                  sx={{
                    color: C.inkLight,
                    textDecoration: "underline",
                    fontSize: "0.85rem",
                  }}
                >
                  Forgot password?
                </Button>
              </Box>
            </Box>
          )}

          {step === "success" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                py: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: C.yellowLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `3px solid ${C.yellow}`,
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.yellowDark}
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  textAlign: "center",
                }}
              >
                Password Changed Successfully!
              </Typography>
              <Typography
                sx={{
                  color: C.inkLight,
                  fontSize: "0.95rem",
                  textAlign: "center",
                }}
              >
                Your password has been updated. You can now use your new
                password to log in.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleClose}
                sx={primaryBtn}
              >
                Close
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
// ─── Main Profile Page ─────────────────────────────────────────────────────────
export default function Profile() {
  const { user_id } = useParams();
  const { showAlert } = useAlert();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/user/${user_id}`);
        setUser(res.data.data);
      } catch {
        showAlert("Unable to load user information.", "error", {
          vertical: "bottom",
          horizontal: "left",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user_id]);

  const handleAvatarSuccess = (url: string) => {
    setUser((u) => (u ? { ...u, avt_url: url } : u));
    showAlert("Avatar updated successfully!", "success", {
      vertical: "bottom",
      horizontal: "left",
    });
  };

  const handleProfileSuccess = (firstName: string, lastName: string) => {
    setUser((u) =>
      u ? { ...u, first_name: firstName, last_name: lastName } : u,
    );
    showAlert("Personal information updated successfully!", "success", {
      vertical: "bottom",
      horizontal: "left",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.cream,
        }}
      >
        <CircularProgress sx={{ color: C.yellow }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.cream,
        }}
      >
        <Typography sx={{ color: C.inkLight }}>User not found.</Typography>
      </Box>
    );
  }

  const fullName = `${user.first_name} ${user.last_name}`;
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  return (
    <>
      <Box sx={{ minHeight: "100vh", background: C.cream }}>
        {/* ── Banner ── */}
        <Box
          sx={{
            height: { xs: 140, md: 180 },
            background: `linear-gradient(135deg, ${C.yellow} 30%, ${C.yellowLight} 50%, #FFF59B 100%)`,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              background: C.cream,
              borderTopLeftRadius: "50% 40px",
              borderTopRightRadius: "50% 40px",
            },
          }}
        />

        {/* ── Card container ── */}
        <Box
          sx={{
            maxWidth: 680,
            mx: "auto",
            px: { xs: 2, md: 0 },
            mt: -6,
            pb: 6,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              background: C.white,
              borderRadius: 5,
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
              overflow: "hidden",
            }}
          >
            {/* ── Avatar section ── */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: 4,
                pb: 3,
                px: 4,
              }}
            >
              <Tooltip title="Change avatar" placement="right">
                <Box
                  onClick={() => setAvatarOpen(true)}
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    "&:hover .cam-overlay": { opacity: 1 },
                    mb: 2,
                  }}
                >
                  <Avatar
                    src={user.avt_url}
                    sx={{
                      width: 110,
                      height: 110,
                      border: `4px solid ${C.yellow}`,
                      fontSize: "2.4rem",
                      fontWeight: 600,
                      background: C.yellowLight,
                      color: C.ink,
                      boxShadow: `0 4px 20px ${C.yellow}66`,
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box
                    className="cam-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.4)",
                      opacity: 0,
                      transition: "opacity 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <CameraIcon />
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: C.yellow,
                      border: `2px solid ${C.white}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.ink,
                    }}
                  >
                    <CameraIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>
              </Tooltip>

              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "1.6rem",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                }}
              >
                {fullName}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: C.border }} />

            {/* ── Personal Info section ── */}
            <Box sx={{ px: { xs: 3, md: 5 }, py: 3.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    letterSpacing: 1.5,
                    color: C.inkLight,
                    textTransform: "uppercase",
                  }}
                >
                  Personal Information
                </Typography>
                <Tooltip title="Edit personal information">
                  <IconButton
                    onClick={() => setEditOpen(true)}
                    size="small"
                    sx={{
                      background: C.yellowLight,
                      border: `1.5px solid ${C.yellowDark}`,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      gap: 0.5,
                      "&:hover": { background: C.yellow },
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16, color: C.ink }} />
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: C.ink,
                      }}
                    >
                      Edit
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>

              {[
                { label: "First Name", value: user.first_name },
                { label: "Last Name", value: user.last_name },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.8,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: C.inkLight,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* ── Account Security section ── */}
            <Box
              sx={{
                px: { xs: 3, md: 5 },
                py: 3.5,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  letterSpacing: 1.5,
                  color: C.inkLight,
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                Account Security
              </Typography>

              <Box
                onClick={() => setPwOpen(true)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2.5,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  "&:hover": {
                    borderColor: C.yellowDark,
                    background: C.yellowLight,
                    transform: "translateY(-1px)",
                    boxShadow: `0 4px 16px ${C.yellow}44`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    background: C.yellowLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px solid ${C.yellowDark}`,
                  }}
                >
                  <LockIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    Change Password
                  </Typography>
                  <Typography sx={{ color: C.inkLight, fontSize: "0.8rem" }}>
                    Regularly update your password to keep your account secure
                  </Typography>
                </Box>
                <Box sx={{ color: C.inkLight, fontSize: "1.2rem" }}>›</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Dialogs ── */}
      {user && (
        <>
          <AvatarDialog
            open={avatarOpen}
            onClose={() => setAvatarOpen(false)}
            user={user}
            onSuccess={handleAvatarSuccess}
          />
          <EditProfileDialog
            open={editOpen}
            onClose={() => setEditOpen(false)}
            user={user}
            onSuccess={(firstName, lastName) => {
              handleProfileSuccess(firstName, lastName);
              setEditOpen(false);
            }}
          />
        </>
      )}
      <ChangePasswordDialog
        open={pwOpen}
        onClose={() => setPwOpen(false)}
        userId={user.id}
      />
    </>
  );
}
