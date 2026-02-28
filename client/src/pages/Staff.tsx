import AddIcon from "@mui/icons-material/Add";
import type { ViewType, StaffFormData } from "../utils/types";
import { useRef, useEffect, useCallback } from "react";
import { useStaff } from "../hooks/useStaff";
import {
  useQueryState,
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import StaffList from "../components/staff/StaffList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import StaffFilter from "../components/staff/StaffFilter";
import CreateStaffForm from "../components/staff/CreateStaffForm";
import StaffForm from "../components/staff/StaffForm";
import StaffDetail from "../components/staff/StaffDetail";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useTranslation } from "react-i18next";

export default function Staff() {
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
    clubId: parseAsInteger,
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

  const handleFilterChange = useCallback(
    (update: Parameters<typeof setFilters>[0]) => {
      setFilters(update);
      setPage(1);
    },
    [setFilters, setPage],
  );

  const {
    staff,
    isLoading,
    error,
    updateStaffMutation,
    deleteStaffMutation,
  } = useStaff({ paginationModel, filters });

  const handleClose = () => {
    setSelectedId(null);
    updateStaffMutation.reset();
    deleteStaffMutation.reset();
    handleViewChange("list");
  };

  const handleUpdateSubmit = (data: StaffFormData) => {
    if (selectedId) {
      updateStaffMutation.mutate({ id: selectedId, data });
    }
  };

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
    return <StaffDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleViewChange("add")}
        >
          {t("staff.newStaff")}
        </Button>
      </Box>

      {currentView === "add" && (
        <CreateStaffForm
          open
          title={t("staff.newStaff")}
          handleClose={handleClose}
          submitButtonText={t("common.add")}
        />
      )}

      {currentView === "update" && selectedId && (
        <StaffForm
          handleClose={handleClose}
          handleSubmit={handleUpdateSubmit}
          isLoading={updateStaffMutation.isPending}
          isSuccess={updateStaffMutation.isSuccess}
          error={updateStaffMutation.error}
          editingId={selectedId}
          submitButtonText={t("common.update")}
        />
      )}

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteStaffMutation.isPending}
          isSuccess={deleteStaffMutation.isSuccess}
          error={deleteStaffMutation.error}
          onConfirm={() =>
            selectedId && deleteStaffMutation.mutate(selectedId)
          }
        />
      )}

      <StaffFilter
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={staff.count}
        showPageSizeSelector
      />

      <StaffList
        staff={staff}
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
        count={staff.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
