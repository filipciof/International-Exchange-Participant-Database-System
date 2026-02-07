import AddIcon from "@mui/icons-material/Add";
import type { ViewType, StaffFormData } from "../utils/types";
import { useRef, useEffect } from "react";
import { useStaff } from "../hooks/useStaff";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import StaffList from "../components/staff/StaffList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import StaffFilter from "../components/staff/StaffFilter";
import StaffAdd from "../components/staff/StaffAdd";
import StaffUpdate from "../components/staff/StaffUpdate";
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
    updateStaffMutation.reset();
    deleteStaffMutation.reset();
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
    staff,
    // countries,
    isLoading,
    error,
    updateStaffMutation,
    deleteStaffMutation,
  } = useStaff({ paginationModel, searchInput });

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

  const handleUpdateStaff = (data: StaffFormData) => {
    if (selectedId) {
      updateStaffMutation.mutate({ id: selectedId, data });
    }
  };

  if (currentView === "update" && selectedId) {
    return (
      <StaffUpdate
        handleClose={handleClose}
        handleUpdateStaff={handleUpdateStaff}
        isLoading={updateStaffMutation.isPending}
        isSuccess={updateStaffMutation.isSuccess}
        error={updateStaffMutation.error}
        id={selectedId}
      />
    );
  }

  const handleDeleteStaff = () => {
    if (selectedId) {
      deleteStaffMutation.mutate(selectedId);
    }
  };

  if (currentView === "detail" && selectedId) {
    return <StaffDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          {t("staff.newStaff")}
        </Button>
      </Box>

      {currentView === "add" && (
        <StaffAdd
          open
          handleClose={handleClose}
        />
      )}

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteStaffMutation.isPending}
          isSuccess={deleteStaffMutation.isSuccess}
          error={deleteStaffMutation.error}
          onConfirm={() => handleDeleteStaff()}
        />
      )}

      <StaffFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
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
        onEdit={handleUpdateOpen}
        onDelete={handleDeleteOpen}
        onRowClick={handleDetailOpen}
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
