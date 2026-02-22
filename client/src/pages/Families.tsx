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
import FamilyForm from "../components/families/FamilyForm";
import FamilyDetail from "../components/families/FamilyDetail";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useTranslation } from "react-i18next";

export default function Families() {
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

  const {
    families,
    isLoading,
    error,
    addFamilyMutation,
    updateFamilyMutation,
    deleteFamilyMutation,
  } = useFamilies({ paginationModel, searchInput });

  const handleClose = () => {
    setSelectedId(null);
    addFamilyMutation.reset();
    updateFamilyMutation.reset();
    deleteFamilyMutation.reset();
    handleViewChange("list");
  };

  const handleSubmit = (data: FamilyFormData) => {
    if (currentView === "update" && selectedId) {
      updateFamilyMutation.mutate({ id: selectedId, data });
    } else {
      addFamilyMutation.mutate(data);
    }
  };

  const isEditing = currentView === "update";
  const mutation = isEditing ? updateFamilyMutation : addFamilyMutation;

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
    return <FamilyDetail handleClose={handleClose} id={selectedId} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleViewChange("add")}
        >
          {t("families.newFamily")}
        </Button>
      </Box>

      {(currentView === "add" || (currentView === "update" && selectedId)) && (
        <FamilyForm
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
          isLoading={deleteFamilyMutation.isPending}
          isSuccess={deleteFamilyMutation.isSuccess}
          error={deleteFamilyMutation.error}
          onConfirm={() =>
            selectedId && deleteFamilyMutation.mutate(selectedId)
          }
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
        count={families.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
