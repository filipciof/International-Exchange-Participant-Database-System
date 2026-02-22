import AddIcon from "@mui/icons-material/Add";
import type { ViewType, DistrictFormData } from "../utils/types";
import { useRef, useEffect } from "react";
import { useDistricts } from "../hooks/useDistricts";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import DistrictList from "../components/districts/DistrictList";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import Loading from "../components/Loading";
import DistrictFilter from "../components/districts/DistrictFilter";
import DistrictForm from "../components/districts/DistrictForm";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import { useTranslation } from "react-i18next";

export default function Districts() {
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
    districts,
    isLoading,
    error,
    addDistrictMutation,
    updateDistrictMutation,
    deleteDistrictMutation,
  } = useDistricts({ paginationModel, searchInput });

  const handleClose = () => {
    setSelectedId(null);
    addDistrictMutation.reset();
    updateDistrictMutation.reset();
    deleteDistrictMutation.reset();
    handleViewChange("list");
  };

  const handleSubmit = (data: DistrictFormData) => {
    if (currentView === "update" && selectedId) {
      updateDistrictMutation.mutate({ id: selectedId, data });
    } else {
      addDistrictMutation.mutate(data);
    }
  };

  const isEditing = currentView === "update";
  const mutation = isEditing ? updateDistrictMutation : addDistrictMutation;

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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => handleViewChange("add")}
        >
          {t("districts.newDistrict")}
        </Button>
      </Box>

      {(currentView === "add" || (currentView === "update" && selectedId)) && (
        <DistrictForm
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
          isLoading={deleteDistrictMutation.isPending}
          isSuccess={deleteDistrictMutation.isSuccess}
          error={deleteDistrictMutation.error}
          onConfirm={() =>
            selectedId && deleteDistrictMutation.mutate(selectedId)
          }
        />
      )}

      <DistrictFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={districts.count}
        showPageSizeSelector
      />

      <DistrictList
        districts={districts}
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
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={districts.count}
        showPageSizeSelector={false}
      />
    </Box>
  );
}
