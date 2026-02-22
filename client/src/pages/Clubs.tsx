import AddIcon from "@mui/icons-material/Add";
import type { ViewType, ClubFormData } from "../utils/types";
import { useRef, useEffect } from "react";
import { useClubs } from "../hooks/useClubs";
import {
  useQueryState,
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import ClubList from "../components/clubs/ClubList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import ClubFilter from "../components/clubs/ClubFilter";
import ClubForm from "../components/clubs/ClubForm";
import ClubDetail from "../components/clubs/ClubDetail";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useTranslation } from "react-i18next";

export default function Clubs() {
  const { t } = useTranslation();
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
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    countryId: parseAsInteger,
    districtId: parseAsInteger,
  });
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

  const {
    clubs,
    isLoading,
    error,
    addClubMutation,
    updateClubMutation,
    deleteClubMutation,
  } = useClubs({ paginationModel, filters });

  const handleClose = () => {
    setSelectedId(null);
    addClubMutation.reset();
    updateClubMutation.reset();
    deleteClubMutation.reset();
    handleViewChange("list");
  };

  const handleSubmit = (data: ClubFormData) => {
    if (currentView === "update" && selectedId) {
      updateClubMutation.mutate({ id: selectedId, data });
    } else {
      addClubMutation.mutate(data);
    }
  };

  const isEditing = currentView === "update";
  const mutation = isEditing ? updateClubMutation : addClubMutation;

  if (isLoading && currentView === "list") {
    return <Loading />;
  }

  if (error && currentView === "list") {
    return (
      <Typography sx={{ color: "error.main" }}>
        {t("common.error", { message: error.message })}
      </Typography>
    );
  }

  if (currentView === "detail" && selectedId) {
    return <ClubDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleViewChange("add")}
        >
          {t("clubs.newClub")}
        </Button>
      </Box>

      {(currentView === "add" || (currentView === "update" && selectedId)) && (
        <ClubForm
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
          isLoading={deleteClubMutation.isPending}
          isSuccess={deleteClubMutation.isSuccess}
          error={deleteClubMutation.error}
          onConfirm={() => selectedId && deleteClubMutation.mutate(selectedId)}
        />
      )}

      <ClubFilter
        filters={filters}
        onFilterChange={(update) => {
          setFilters(update);
          setPage(1);
        }}
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

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={clubs.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
