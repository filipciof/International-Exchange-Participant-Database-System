import { useState, useEffect, useRef } from "react";
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
import AddContact from "../components/contacts/ContactAdd";
import UpdateContact from "../components/contacts/ContactUpdate";
import ContactDetail from "../components/contacts/ContactDetail";
import ContactCard from "../components/contacts/ContactCard";
import ContactList from "../components/contacts/ContactList";
import type { Contact, ContactFormData, Country } from "../utils/types";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useContacts } from "../hooks/useContacts";
import MyPagination from "../components/MyPagination";
import ContactFilter from "../components/contacts/ContactFilter";

type ViewType = "list" | "add" | "update" | "delete" | "detail";

export default function Contacts() {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 25,
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const scrollPositionRef = useRef<number>(0);

  useEffect(() => {
    if (currentView === "list") {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  const handleViewChange = (newView: ViewType) => {
    if (currentView === "list") {
      scrollPositionRef.current = window.scrollY;
    }
    setCurrentView(newView);
  };

  const {
    contacts,
    countries,
    isLoading,
    error,
    addContactMutation,
    updateContactMutation,
    deleteContactMutation,
  } = useContacts({
    paginationModel,
    selectedGroups,
    selectedCountry,
    searchInput,
  });

  const handleAddContact = (contact: ContactFormData) => {
    addContactMutation.mutate(contact);
  };

  const handleUpdateContact = (data: ContactFormData) => {
    if (selectedContact) {
      updateContactMutation.mutate({ id: selectedContact.id, data });
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    if (selectedContact) {
      deleteContactMutation.mutate(contact.id);
    }
  };

  const handleClose = () => {
    addContactMutation.reset();
    updateContactMutation.reset();
    deleteContactMutation.reset();
    setSelectedContact(null);
    handleViewChange("list");
  };

  const handleAddOpen = () => {
    handleViewChange("add");
  };

  const handleUpdateOpen = (contact: Contact) => {
    setSelectedContact(contact);
    handleViewChange("update");
  };

  const handleDeleteOpen = (contact: Contact) => {
    setSelectedContact(contact);
    handleViewChange("delete");
  };

  const handleDetailOpen = (contact: Contact) => {
    setSelectedContact(contact);
    handleViewChange("detail");
  };

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "card" | "list" | null
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  if (isLoading && currentView === "list") return <Loading />;
  if (error && currentView === "list")
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {error.message}
      </Typography>
    );

  if (currentView === "add") {
    return (
      <AddContact
        handleClose={handleClose}
        handleAddContact={handleAddContact}
        isLoading={addContactMutation.isPending}
        isSuccess={addContactMutation.isSuccess}
        error={addContactMutation.error}
        countries={countries}
      />
    );
  }

  if (currentView === "update" && selectedContact) {
    return (
      <UpdateContact
        handleClose={handleClose}
        handleUpdateContact={handleUpdateContact}
        isLoading={updateContactMutation.isPending}
        isSuccess={updateContactMutation.isSuccess}
        error={updateContactMutation.error}
        countries={countries}
        contact={selectedContact}
      />
    );
  }

  if (currentView === "detail" && selectedContact) {
    return (
      <ContactDetail contact={selectedContact} handleClose={handleClose} />
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          New contact
        </Button>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
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

      {selectedContact && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteContactMutation.isPending}
          isSuccess={deleteContactMutation.isSuccess}
          error={deleteContactMutation.error}
          onConfirm={() => handleDeleteContact(selectedContact)}
        />
      )}

      <ContactFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        countries={countries}
        selectedGroups={selectedGroups}
        setSelectedGroups={setSelectedGroups}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={contacts.count}
        showPageSizeSelector
      />

      {viewMode === "card" && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {contacts.results.map((contact: Contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onCardClick={handleDetailOpen}
              onEdit={handleUpdateOpen}
              onDelete={handleDeleteOpen}
            />
          ))}
        </Box>
      )}

      {viewMode === "list" && (
        <Box>
          <ContactList
            contacts={contacts}
            paginationModel={paginationModel}
            setPaginationModel={setPaginationModel}
            isLoading={isLoading}
            onEdit={handleUpdateOpen}
            onDelete={handleDeleteOpen}
            onRowClick={handleDetailOpen}
          />
        </Box>
      )}

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={contacts.count}
        showPageSizeSelector={false}
      />
    </>
  );
}
