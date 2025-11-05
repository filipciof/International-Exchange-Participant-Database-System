import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import ContactForm from "../components/ContactForm";
import ContactCard from "../components/ContactCard";
import ContactList from "../components/ContactList";
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
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

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

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "card" | "list" | null
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Typography sx={{ color: "error.main" }}>Error: {error.message}</Typography>
    );

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleClickOpen}
        >
          New contact
        </Button>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
        >
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="table view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ContactForm
        open={open}
        handleClose={handleClose}
        handleAddContact={handleAddContact}
        isLoading={addContactMutation.isPending}
        isSuccess={addContactMutation.isSuccess}
        error={addContactMutation.error}
      />

      <Box sx={{ display: viewMode === "card" ? "flex" : "none", flexWrap: "wrap" }}>
        {
          contacts.map((contact: Contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))
        }
      </Box>

      <Box sx={{ display: viewMode === "list" ? "flex" : "none", flexWrap: "wrap" }}>
        <ContactList contacts={contacts} />
      </Box>
    </>
  );
}