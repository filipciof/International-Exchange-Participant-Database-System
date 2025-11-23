import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import type { Contact } from "../utils/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";

type ContactDetailDialogProps = {
  open: boolean;
  contact: Contact;
  handleClose: () => void;
};

export default function ContactDetailDialog({
  open,
  contact,
  handleClose,
}: ContactDetailDialogProps) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactImage", contact.photo],
    queryFn: async () => {
      const photoName = contact.photo.split("/")[3];
      const response = await axiosClient.get(
        `/contacts/photos/?photo_name=${photoName}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!contact.photo,
    staleTime: Infinity,
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          Contact Details
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Photo and Name Section */}
          <Stack alignItems="center" spacing={2}>
            <Avatar
              src={!isLoading ? imageUrl || undefined : undefined}
              alt={`${contact.first_name} ${contact.last_name}`}
              sx={{ width: 120, height: 120 }}
            />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold">
                {contact.first_name}{" "}
                {contact.middle_name && `${contact.middle_name} `}
                {contact.last_name}
              </Typography>
              {contact.gender_name && (
                <Typography variant="body2" color="text.secondary">
                  {contact.gender_name}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider />

          {/* Contact Information */}
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Contact Information
            </Typography>
            {contact.email && (
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon color="action" fontSize="small" />
                <Typography>{contact.email}</Typography>
              </Stack>
            )}
            {contact.phone && (
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon color="action" fontSize="small" />
                <Typography>{contact.phone}</Typography>
              </Stack>
            )}
          </Stack>

          <Divider />

          {/* Location Information */}
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Location
            </Typography>
            {contact.country && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Country
                </Typography>
                <Typography>{contact.country}</Typography>
              </Box>
            )}
            {contact.districts.length > 0 && (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Districts
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {contact.districts.map((district) => (
                    <Chip
                      key={district}
                      label={district}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>

          <Divider />

          {/* Program Participation */}
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Programs
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {contact.is_longterm && (
                <Chip label="Long Term" color="primary" size="small" />
              )}
              {contact.is_family_to_family && (
                <Chip label="Family to Family" color="secondary" size="small" />
              )}
              {contact.is_camp && (
                <Chip label="Camp" color="success" size="small" />
              )}
              {!contact.is_longterm &&
                !contact.is_family_to_family &&
                !contact.is_camp && (
                  <Typography variant="body2" color="text.secondary">
                    No programs assigned
                  </Typography>
                )}
            </Stack>
          </Stack>

          {/* Notes */}
          {contact.notes && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight="bold">
                  Notes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {contact.notes}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
