import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ActionAreaCard from "../components/ActionAreaCard";
import AddIcon from "@mui/icons-material/Add";
import ContactForm from "../components/ContactForm";
import queryClient from "../utils/queryClient";

export type Contact = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  districts: string[];
  photo: string;
};

export type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  districts: string;
  photo: File | null;
};

export default function Contacts() {
  const [open, setOpen] = useState(false);

  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const response = await axiosClient.get("/contacts/");
      return response.data;
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (newContact: ContactFormData) => {
      const response = await axiosClient.post("/contacts/", newContact, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  const handleAddContact = (contact: ContactFormData) => {
    addContactMutation.mutate(contact);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    addContactMutation.reset();
    setOpen(false);
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Typography sx={{ color: "red" }}>Error: {error.message}</Typography>
    );

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
      >
        New contact
      </Button>

      <ContactForm
        open={open}
        handleClose={handleClose}
        handleAddContact={handleAddContact}
        isLoading={addContactMutation.isPending}
        isSuccess={addContactMutation.isSuccess}
        error={addContactMutation.error} 
      />
      <Box style={{ display: "flex", flexWrap: "wrap" }}>
        {contacts.map((contact: Contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </Box>
    </>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
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

  if (isLoading) return <CircularProgress sx={{ color: "secondary.main" }} />;

  return (
    <ActionAreaCard
      imageUrl={imageUrl || ""}
      header={`${contact.first_name} ${contact.last_name}`}
      description={[
        contact.country,
        contact.districts.join(", "),
        contact.email,
        contact.phone,
      ]}
    />
  );
}
