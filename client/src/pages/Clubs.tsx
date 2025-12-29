import AddIcon from "@mui/icons-material/Add";
import type { ViewType, ClubFormData } from "../utils/types";
import { useRef, useEffect } from "react";
import { useClubs } from "../hooks/useClubs";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import ClubList from "../components/clubs/ClubList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import ClubFilter from "../components/clubs/ClubFilter";
import ClubAdd from "../components/clubs/ClubAdd";
import ClubUpdate from "../components/clubs/ClubUpdate";
import ClubDetail from "../components/clubs/ClubDetail";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

export default function Clubs() {
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
  const [selectedId, setSelectedId] = useQueryState("id", parseAsInteger);
  const [searchInput, setSearchInput] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
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

  const handleClose = () => {
    setSelectedId(null);
    addClubMutation.reset();
    updateClubMutation.reset();
    deleteClubMutation.reset();
    handleViewChange("list");
  };

  const handleAddOpen = () => {
    handleViewChange("add");
  };

  const handleUpdateOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("update");
  };

  const handleDeleteOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("delete");
  };

  const handleDetailOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("detail");
  };

  const {
    clubs,
    countries,
    isLoading,
    error,
    addClubMutation,
    updateClubMutation,
    deleteClubMutation,
  } = useClubs({ paginationModel, searchInput });

  if (isLoading && currentView === "list") {
    return <Loading />;
  }

  if (error && currentView === "list") {
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {error.message}
      </Typography>
    );
  }

  const handleAddClub = (club: ClubFormData) => {
    addClubMutation.mutate(club);
  };

  if (currentView === "add") {
    return (
      <ClubAdd
        handleClose={handleClose}
        handleAddClub={handleAddClub}
        isLoading={addClubMutation.isPending}
        isSuccess={addClubMutation.isSuccess}
        error={addClubMutation.error}
        countries={countries}
      />
    );
  }

  const handleUpdateClub = (data: ClubFormData) => {
    if (selectedId) {
      updateClubMutation.mutate({ id: selectedId, data });
    }
  };

  if (currentView === "update" && selectedId) {
    return (
      <ClubUpdate
        handleClose={handleClose}
        handleUpdateClub={handleUpdateClub}
        isLoading={updateClubMutation.isPending}
        isSuccess={updateClubMutation.isSuccess}
        error={updateClubMutation.error}
        countries={countries}
        id={selectedId}
      />
    );
  }

  const handleDeleteClub = () => {
    if (selectedId) {
      deleteClubMutation.mutate(selectedId);
    }
  };

  if (currentView === "detail" && selectedId) {
    return <ClubDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          New club
        </Button>
      </Box>

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteClubMutation.isPending}
          isSuccess={deleteClubMutation.isSuccess}
          error={deleteClubMutation.error}
          onConfirm={() => handleDeleteClub()}
        />
      )}

      <ClubFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={clubs.count}
        showPageSizeSelector
      />

      <ClubList
        clubs={clubs}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        isLoading={isLoading}
        onEdit={handleUpdateOpen}
        onDelete={handleDeleteOpen}
        onRowClick={handleDetailOpen}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={clubs.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
