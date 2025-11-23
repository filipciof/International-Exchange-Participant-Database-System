import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import Loading from "../components/Loading";
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import AddContactForm from "../components/AddContactForm";
import ContactCard from "../components/ContactCard";
import ContactList from "../components/ContactList";
import queryClient from "../utils/queryClient";
import type { Contact, ContactFormData, Country } from "../utils/types";
import SearchInput from "../components/SearchInput";
import UpdateContactForm from "../components/UpdateContactForm";

export default function Contacts() {
  const [open, setOpen] = useState<"none" | "add" | "update">("none");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 25,
  });
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    data: contacts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "contacts",
      paginationModel,
      selectedGroups,
      selectedCountry,
      searchInput,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      if (selectedCountry) {
        params.append("country", selectedCountry.id.toString());
      }

      selectedGroups.forEach((group) => {
        params.append("group", group);
      });

      if (searchInput) {
        params.append("search", searchInput);
      }

      const response = await axiosClient.get(`/contacts/?${params.toString()}`);

      console.log(response.data);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      console.log(response.data);
      return response.data;
    },
    staleTime: Infinity,
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

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContactFormData }) => {
      const response = await axiosClient.patch(`/contacts/${id}/`, data, {
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

  const handleUpdateContact = (data: ContactFormData) => {
    if (selectedContact) {
      updateContactMutation.mutate({ id: selectedContact.id, data });
    }
  };

  const handleAddOpen = () => {
    setOpen("add");
  };

  const handleClose = () => {
    addContactMutation.reset();
    setSelectedContact(null);
    setOpen("none");
  };

  const handleUpdateOpen = (contact: Contact) => {
    setSelectedContact(contact);
    setOpen("update");
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
      <Typography sx={{ color: "error.main" }}>
        Error: {error.message}
      </Typography>
    );

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

      {/* <ContactForm
        open={open}
        handleClose={handleClose}
        handleAddContact={handleAddContact}
        isLoading={addContactMutation.isPending}
        isSuccess={addContactMutation.isSuccess}
        error={addContactMutation.error}
        countries={countries}
      /> */}
      <AddContactForm
        open={open === "add"}
        handleClose={handleClose}
        handleAddContact={handleAddContact}
        isLoading={addContactMutation.isPending}
        isSuccess={addContactMutation.isSuccess}
        error={addContactMutation.error}
        countries={countries}
      />
      {selectedContact ? (
        <UpdateContactForm
          open={open === "update"}
          handleClose={handleClose}
          handleUpdateContact={handleUpdateContact}
          isLoading={updateContactMutation.isPending}
          isSuccess={updateContactMutation.isSuccess}
          error={updateContactMutation.error}
          countries={countries}
          contact={selectedContact}
        />
      ) : (
        <></>
      )}
      <SearchInput
        value={searchInput}
        onChange={(newSearchInput) => {
          setPaginationModel({ ...paginationModel, page: 1 });
          setSearchInput(newSearchInput);
        }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          my: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Filter by country:
        </Typography>
        <Autocomplete
          value={selectedCountry}
          onChange={(_event, newValue) => {
            setPaginationModel({ ...paginationModel, page: 1 });
            setSelectedCountry(newValue);
          }}
          options={countries}
          getOptionLabel={(option) => option.name}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Select country" size="small" />
          )}
        />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Filter by group:
        </Typography>
        <ToggleButtonGroup
          value={selectedGroups}
          onChange={(_event, newGroups) => {
            setPaginationModel({ ...paginationModel, page: 1 });
            setSelectedGroups(newGroups);
          }}
          aria-label="group filters"
          sx={{
            gap: 1,
            "& .MuiToggleButton-root": {
              borderRadius: "20px",
              textTransform: "lowercase",
              border: "1px solid",
              borderColor: "divider",
              "&.Mui-selected": {
                borderColor: "secondary.main",
              },
            },
          }}
        >
          <ToggleButton value="lt" aria-label="group 1">
            <Typography>longterm</Typography>
          </ToggleButton>
          <ToggleButton value="f2f" aria-label="group 2">
            <Typography>family-to-family</Typography>
          </ToggleButton>
          <ToggleButton value="camp" aria-label="group 3">
            <Typography>camp</Typography>
          </ToggleButton>
          <ToggleButton value="none" aria-label="unassigned">
            <Typography>unassigned</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "center",
          gap: 2,
          my: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Results per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={paginationModel.pageSize}
              onChange={(e) =>
                setPaginationModel({
                  page: 1,
                  pageSize: Number(e.target.value),
                })
              }
              sx={{ minWidth: 70 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Pagination
          count={Math.ceil(contacts.count / paginationModel.pageSize)}
          page={paginationModel.page}
          onChange={(_, page) =>
            setPaginationModel({
              ...paginationModel,
              page: page,
            })
          }
          showFirstButton
          showLastButton
          color="secondary"
          variant="outlined"
          shape="rounded"
        />
      </Box>

      <Box
        sx={{
          display: viewMode === "card" ? "flex" : "none",
          flexWrap: "wrap",
        }}
      >
        {contacts.results.map((contact: Contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onCardClick={handleUpdateOpen}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: viewMode === "list" ? "flex" : "none",
          flexWrap: "wrap",
        }}
      >
        <ContactList
          contacts={contacts}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          isLoading={isLoading}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          // justifyContent: "center",
          gap: 2,
          my: 3,
        }}
      >
        <Pagination
          count={Math.ceil(contacts.count / paginationModel.pageSize)}
          page={paginationModel.page}
          onChange={(_, page) =>
            setPaginationModel({
              ...paginationModel,
              page: page,
            })
          }
          showFirstButton
          showLastButton
          color="secondary"
          variant="outlined"
          shape="rounded"
        />
      </Box>
    </>
  );
}
