import AddIcon from "@mui/icons-material/Add";
import type { ViewType, FamilyFormData } from "../utils/types";
import { useRef, useEffect } from "react";
import { useFamilies } from "../hooks/useFamilies";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import FamilyList from "../components/families/FamilyList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import FamilyFilter from "../components/families/FamilyFilter";
import FamilyAdd from "../components/families/FamilyAdd";
import FamilyUpdate from "../components/families/FamilyUpdate";
import FamilyDetail from "../components/families/FamilyDetail";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";

export default function Families() {
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
    addFamilyMutation.reset();
    updateFamilyMutation.reset();
    deleteFamilyMutation.reset();
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
    families,
    isLoading,
    error,
    addFamilyMutation,
    updateFamilyMutation,
    deleteFamilyMutation,
  } = useFamilies({ paginationModel, searchInput });

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

  const handleAddFamily = (family: FamilyFormData) => {
    addFamilyMutation.mutate(family);
  };

  if (currentView === "add") {
    return (
      <FamilyAdd
        handleClose={handleClose}
        handleAddFamily={handleAddFamily}
        isLoading={addFamilyMutation.isPending}
        isSuccess={addFamilyMutation.isSuccess}
        error={addFamilyMutation.error}
      />
    );
  }

  const handleUpdateFamily = (data: FamilyFormData) => {
    if (selectedId) {
      updateFamilyMutation.mutate({ id: selectedId, data });
    }
  };

  if (currentView === "update" && selectedId) {
    return (
      <FamilyUpdate
        handleClose={handleClose}
        handleUpdateFamily={handleUpdateFamily}
        isLoading={updateFamilyMutation.isPending}
        isSuccess={updateFamilyMutation.isSuccess}
        error={updateFamilyMutation.error}
        id={selectedId}
      />
    );
  }

  const handleDeleteFamily = () => {
    if (selectedId) {
      deleteFamilyMutation.mutate(selectedId);
    }
  };

  if (currentView === "detail" && selectedId) {
    return <FamilyDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          New family
        </Button>
      </Box>

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteFamilyMutation.isPending}
          isSuccess={deleteFamilyMutation.isSuccess}
          error={deleteFamilyMutation.error}
          onConfirm={() => handleDeleteFamily()}
        />
      )}

      <FamilyFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={families.count}
        showPageSizeSelector
      />

      <FamilyList
        families={families}
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
        count={families.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
