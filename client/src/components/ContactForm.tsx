import { type ChangeEvent, type FormEvent } from "react";
import {
  Dialog,
  DialogTitle,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Typography,
  List,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { SingleFileUpload, FileDropzoneInputBody } from "mui-file-upload";
import axiosClient from "../utils/axiosClient";
import { isAxiosError } from "axios";
import { type Contact } from "../pages/Contacts";

type ContactFormProps = {
  open: boolean;
  handleClose: () => void;
  handleAddContact: (contact: Contact) => void;
};

interface ValidationErrors {
  [key: string]: string[];
}

export default function ContactForm({
  open,
  handleClose,
  handleAddContact,
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
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const requestBody = { ...formData, photo: photo };
    try {
      const response = await axiosClient.post("/contacts/", requestBody, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      handleAddContact(response.data);
      setSuccess(true);
      setError(false);
      setErrorMessages([]);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setSuccess(false);
        setError(true);
        setErrorMessages(handleValidationErrors(err.response?.data));
      } else {
        console.error("An unexpected error occurred", err);
      }
    } finally {
      setLoading(false);
    }
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
            {loading ? (
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
              {errorMessages.map((message) => (
                <Typography sx={{ color: "red" }}>{message}</Typography>
              ))}
            </List>
          ) : (
            <></>
          )}
          {success ? (
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
