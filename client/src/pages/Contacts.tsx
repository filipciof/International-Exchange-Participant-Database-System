import { useState, useEffect, useRef } from "react";
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
import AddContactView from "../components/AddContactView";
import UpdateContactView from "../components/UpdateContactView";
import ContactDetailView from "../components/ContactDetailView";
import ContactCard from "../components/ContactCard";
import ContactList from "../components/ContactList";
import queryClient from "../utils/queryClient";
import type { Contact, ContactFormData, Country } from "../utils/types";
import SearchInput from "../components/SearchInput";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

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

  // Restore scroll position when returning to list view
  useEffect(() => {
    if (currentView === "list") {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
      });
    } else {
      // Scroll to top when switching to other views
      window.scrollTo(0, 0);
    }
  }, [currentView]);

  // Save scroll position before leaving list view
  const handleViewChange = (newView: ViewType) => {
    if (currentView === "list") {
      scrollPositionRef.current = window.scrollY;
    }
    setCurrentView(newView);
  };

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

      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
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

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosClient.delete(`/contacts/${id}/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

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

  // Render full-page views
  if (currentView === "add") {
    return (
      <AddContactView
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
      <UpdateContactView
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
      <ContactDetailView contact={selectedContact} handleClose={handleClose} />
    );
  }

  // Render contacts list view
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

      {/* Delete dialog still uses dialog since it's a confirmation */}
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
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          gap: { xs: 2, md: 3 },
          my: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", minWidth: "fit-content" }}
          >
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
            sx={{ minWidth: { xs: "100%", sm: 200 }, flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select country"
                size="small"
              />
            )}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", minWidth: "fit-content" }}
          >
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
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                borderRadius: "20px",
                textTransform: "lowercase",
                border: "1px solid",
                borderColor: "divider",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                padding: { xs: "4px 8px", sm: "6px 12px" },
                "&.Mui-selected": {
                  borderColor: "secondary.main",
                },
              },
            }}
          >
            <ToggleButton value="lt" aria-label="group 1">
              longterm
            </ToggleButton>
            <ToggleButton value="f2f" aria-label="group 2">
              family-to-family
            </ToggleButton>
            <ToggleButton value="camp" aria-label="group 3">
              camp
            </ToggleButton>
            <ToggleButton value="none" aria-label="unassigned">
              unassigned
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
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
          siblingCount={0}
          sx={{
            "& .MuiPagination-ul": {
              flexWrap: "nowrap",
            },
          }}
        />
      </Box>
      {/* <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
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
          siblingCount={0}
          sx={{
            "& .MuiPagination-ul": {
              flexWrap: "nowrap",
            },
          }}
        />
      </Box> */}
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

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
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
          siblingCount={0}
          sx={{
            "& .MuiPagination-ul": {
              flexWrap: "nowrap",
            },
          }}
        />
      </Box>
    </>
  );
}
