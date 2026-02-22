import { useEffect, useRef } from "react";
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
import ContactForm from "../components/contacts/ContactForm";
import ContactDetail from "../components/contacts/ContactDetail";
import ContactCard from "../components/contacts/ContactCard";
import ContactList from "../components/contacts/ContactList";
import type {
  Contact,
  ContactFormData,
  ViewType,
} from "../utils/types";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useContacts } from "../hooks/useContacts";
import MyPagination from "../components/MyPagination";
import ContactFilter from "../components/contacts/ContactFilter";
import { useQueryState } from "nuqs";
import {
  parseAsStringLiteral,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";
import { useTranslation } from "react-i18next";

export default function Contacts() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useQueryState(
    "view",
    parseAsStringLiteral([
      "list",
      "add",
      "update",
      "delete",
      "detail",
    ]).withDefault("list"),
  );
  const [viewMode, setViewMode] = useQueryState(
    "viewMode",
    parseAsStringLiteral(["card", "list"]).withDefault("card"),
  );
  const [selectedId, setSelectedId] = useQueryState("id", parseAsInteger);

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(25),
  );
  const paginationModel = { page, pageSize };
  const setPaginationModel = (model: { page: number; pageSize: number }) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const [selectedGroups, setSelectedGroups] = useQueryState(
    "groups",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [selectedCountryId, setSelectedCountryId] = useQueryState(
    "country",
    parseAsInteger,
  );
  const [searchInput, setSearchInput] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

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
    selectedCountryId,
    searchInput,
  });

  const handleClose = () => {
    setSelectedId(null);
    addContactMutation.reset();
    updateContactMutation.reset();
    deleteContactMutation.reset();
    handleViewChange("list");
  };

  const handleSubmit = (data: ContactFormData) => {
    if (currentView === "update" && selectedId) {
      updateContactMutation.mutate({ id: selectedId, data });
    } else {
      addContactMutation.mutate(data);
    }
  };

  const isEditing = currentView === "update";
  const mutation = isEditing ? updateContactMutation : addContactMutation;

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "card" | "list" | null,
  ) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  if (isLoading && currentView === "list") return <Loading />;
  if (error && currentView === "list")
    return (
      <Typography sx={{ color: "error.main" }}>
        {t("common.error", { message: error.message })}
      </Typography>
    );

  if (currentView === "detail" && selectedId) {
    return <ContactDetail id={selectedId} handleClose={handleClose} />;
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleViewChange("add")}
        >
          {t("contacts.newContact")}
        </Button>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="card" aria-label={t("common.cardView")}>
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label={t("common.tableView")}>
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {(currentView === "add" ||
        (currentView === "update" && selectedId)) && (
        <ContactForm
          handleClose={handleClose}
          handleSubmit={handleSubmit}
          isLoading={mutation.isPending}
          isSuccess={mutation.isSuccess}
          error={mutation.error}
          editingId={isEditing ? selectedId : undefined}
          submitButtonText={
            isEditing ? t("common.update") : t("common.add")
          }
        />
      )}

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteContactMutation.isPending}
          isSuccess={deleteContactMutation.isSuccess}
          error={deleteContactMutation.error}
          onConfirm={() =>
            selectedId && deleteContactMutation.mutate(selectedId)
          }
        />
      )}

      <ContactFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        selectedCountry={
          countries.find((c) => c.id === selectedCountryId) || null
        }
        setSelectedCountry={(country) =>
          setSelectedCountryId(country?.id || null)
        }
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
              onCardClick={(id: number) => {
                setSelectedId(id);
                handleViewChange("detail");
              }}
              onEdit={(id: number) => {
                setSelectedId(id);
                handleViewChange("update");
              }}
              onDelete={(id: number) => {
                setSelectedId(id);
                handleViewChange("delete");
              }}
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
            onEdit={(id: number) => {
              setSelectedId(id);
              handleViewChange("update");
            }}
            onDelete={(id: number) => {
              setSelectedId(id);
              handleViewChange("delete");
            }}
            onRowClick={(id: number) => {
              setSelectedId(id);
              handleViewChange("detail");
            }}
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
