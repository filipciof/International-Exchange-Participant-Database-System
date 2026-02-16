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
import DistrictAdd from "../components/districts/DistrictAdd";
import DistrictUpdate from "../components/districts/DistrictUpdate";
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

  const handleClose = () => {
    setSelectedId(null);
    addDistrictMutation.reset();
    updateDistrictMutation.reset();
    deleteDistrictMutation.reset();
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

  const {
    districts,
    isLoading,
    error,
    addDistrictMutation,
    updateDistrictMutation,
    deleteDistrictMutation,
  } = useDistricts({ paginationModel, searchInput });

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

  const handleAddDistrict = (district: DistrictFormData) => {
    addDistrictMutation.mutate(district);
  };

  if (currentView === "add") {
    return (
      <DistrictAdd
        handleClose={handleClose}
        handleAddDistrict={handleAddDistrict}
        isLoading={addDistrictMutation.isPending}
        isSuccess={addDistrictMutation.isSuccess}
        error={addDistrictMutation.error}
      />
    );
  }

  const handleUpdateDistrict = (data: DistrictFormData) => {
    if (selectedId) {
      updateDistrictMutation.mutate({ id: selectedId, data });
    }
  };

  if (currentView === "update" && selectedId) {
    return (
      <DistrictUpdate
        handleClose={handleClose}
        handleUpdateDistrict={handleUpdateDistrict}
        isLoading={updateDistrictMutation.isPending}
        isSuccess={updateDistrictMutation.isSuccess}
        error={updateDistrictMutation.error}
        id={selectedId}
      />
    );
  }

  const handleDeleteDistrict = () => {
    if (selectedId) {
      deleteDistrictMutation.mutate(selectedId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          {t("districts.newDistrict")}
        </Button>
      </Box>

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteDistrictMutation.isPending}
          isSuccess={deleteDistrictMutation.isSuccess}
          error={deleteDistrictMutation.error}
          onConfirm={() => handleDeleteDistrict()}
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
        onEdit={handleUpdateOpen}
        onDelete={handleDeleteOpen}
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
