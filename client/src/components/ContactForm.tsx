import { type ChangeEvent, type FormEvent } from "react";
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Typography,
  useMediaQuery,
  List,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import { type ContactFormData } from "../pages/Contacts";

type ContactFormProps = {
  open: boolean;
  handleClose: () => void;
  handleAddContact: (contact: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
};

interface ValidationErrors {
  [key: string]: string[];
}

export default function ContactForm({
  open,
  handleClose,
  handleAddContact,
  isLoading,
  isSuccess,
  error,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    country: "",
    districts: "",
    email: "",
    phone: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const newContact = { ...formData, photo: photo };
    handleAddContact(newContact);
  };

  const handleValidationErrors = (errors: ValidationErrors) => {
    let errorMessages: string[] = [];
    Object.values(errors).forEach((messagesArray) => {
      errorMessages = [...errorMessages, ...messagesArray];
    });
    return errorMessages;
  };

  const handlePhotoUpload = (newPhoto: File) => {
    setPhoto(newPhoto);
    return new Promise((resolve) => {
      resolve("");
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>
      <DialogTitle>New Contact</DialogTitle>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="First Name"
              variant="outlined"
              name="first_name"
              fullWidth
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Last Name"
              variant="outlined"
              name="last_name"
              fullWidth
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Country"
              variant="outlined"
              name="country"
              fullWidth
              value={formData.country}
              onChange={handleChange}
              required
            />
            <TextField
              label="Districts"
              variant="outlined"
              name="districts"
              fullWidth
              value={formData.districts}
              onChange={handleChange}
              required
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Email"
              variant="outlined"
              name="email"
              fullWidth
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Phone Number"
              variant="outlined"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Stack>
          <SingleFileUpload
            uploadService={handlePhotoUpload}
            body={<FileDropzoneInputBody title="Upload photo" />}
          />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            {isLoading ? (
              <CircularProgress sx={{ color: "secondary.main" }} />
            ) : (
              <Button variant="contained" type="submit">
                Add
              </Button>
            )}
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
          </Stack>
          {error ? (
            <List>
              {handleValidationErrors(error.response?.data).map(
                (message: string) => (
                  <Typography sx={{ color: "red" }}>{message}</Typography>
                )
              )}
            </List>
          ) : (
            // <Typography sx={{ color: "red" }}>
            //   Error: {error.message}
            // </Typography>
            <></>
          )}
          {isSuccess ? (
            <Typography sx={{ color: "green" }}>
              New contact added successfully!
            </Typography>
          ) : (
            <></>
          )}
        </Stack>
      </form>
    </Dialog>
  );
}
