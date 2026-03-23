import { useEffect, useRef } from "react";
import StudentList from "../components/students/StudentList";
import Loading from "../components/Loading";
import { Box, Button, Typography, CircularProgress, MenuItem, Select } from "@mui/material";
import MyPagination from "../components/MyPagination";
import type { ViewType } from "../utils/types";
import StudentDetail from "../components/students/StudentDetail";
import AddStudent from "../components/students/StudentAdd";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { useStudents } from "../hooks/useStudents";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import StudentFilter from "../components/students/StudentFilter";
import {
  useQueryState,
  useQueryStates,
  parseAsStringLiteral,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";
import { useTranslation } from "react-i18next";
import { useYear } from "../hooks/useYear";

export default function Students() {
  const { t } = useTranslation();
  const { years, currentYear } = useYear();
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
  const [selectedId, setSelectedId] = useQueryState("id", parseAsInteger);

  // Pagination
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

  // Filters
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    shirtSizes: parseAsArrayOf(parseAsString).withDefault([]),
    genders: parseAsArrayOf(parseAsInteger).withDefault([]),
    isInbound: parseAsStringLiteral(["true", "false", "both"]).withDefault("both"),
    year: parseAsString,
    dateOfBirthBefore: parseAsString.withDefault(""),
    dateOfBirthAfter: parseAsString.withDefault(""),
    sendingClubId: parseAsInteger,
    receivingClubId: parseAsInteger,
    exchangeStartDateBefore: parseAsString.withDefault(""),
    exchangeStartDateAfter: parseAsString.withDefault(""),
    exchangeEndDateBefore: parseAsString.withDefault(""),
    exchangeEndDateAfter: parseAsString.withDefault(""),
  });

  useEffect(() => {
    if (currentYear) {
      if (filters.year === null) {
        setFilters({ year: currentYear.value });
      }
    } else {
      setFilters({ year: null });
    }
  }, [currentYear?.id, years.length]);

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

  const {
    students,
    isLoading,
    error,
    updateStudentMutation,
    deleteStudentMutation,
    exportStudentsMutation,
  } = useStudents({ paginationModel, filters });

  const handleViewChange = (newView: ViewType) => {
    if (currentView === "list") {
      scrollPositionRef.current = window.scrollY;
    }
    setCurrentView(newView);
  };

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Typography sx={{ color: "error.main" }}>
        {t("common.error", { message: error.message })}
      </Typography>
    );

  const handleClose = () => {
    setSelectedId(null);
    deleteStudentMutation.reset();
    updateStudentMutation.reset();
    handleViewChange("list");
  };

  const handleDetailOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("detail");
  };

  const handleAddOpen = () => {
    handleViewChange("add");
  };

  const handleDeleteOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("delete");
  };

  const handleDeleteStudent = () => {
    if (selectedId) {
      deleteStudentMutation.mutate(selectedId);
    }
  };

  if (currentView === "detail" && selectedId) {
    return <StudentDetail id={selectedId} handleClose={handleClose} />;
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddOpen}
          >
            {t("students.newStudent")}
          </Button>
          <Select
            value={filters.year ?? ""}
            onChange={(e) => {
              setFilters({ year: e.target.value || null });
              setPage(1);
            }}
            size="small"
            displayEmpty
          >
            <MenuItem value="">{t("common.allYears")}</MenuItem>
            {years.map((year) => (
              <MenuItem key={year.id} value={year.value}>{year.value}</MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
          <Button
            variant="outlined"
            startIcon={
              exportStudentsMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={() => exportStudentsMutation.mutate("csv")}
            disabled={exportStudentsMutation.isPending}
          >
            {exportStudentsMutation.isPending
              ? t("common.exporting")
              : t("common.export")}
          </Button>

          {/* <Button
            variant="outlined"
            startIcon={
              exportStudentsMutation.isPending ? (
                <CircularProgress size={20} />
              ) : (
                <DownloadIcon />
              )
            }
            onClick={() => exportStudentsMutation.mutate("pdf")}
            disabled={exportStudentsMutation.isPending}
          >
            {exportStudentsMutation.isPending ? "Exporting..." : "Export as PDF"}
          </Button> */}
        </Box>
      </Box>

      {currentView === "add" && <AddStudent open handleClose={handleClose} />}

      {selectedId && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteStudentMutation.isPending}
          isSuccess={deleteStudentMutation.isSuccess}
          error={deleteStudentMutation.error}
          onConfirm={() => handleDeleteStudent()}
        />
      )}

      <StudentFilter
        filters={filters}
        onFilterChange={(update) => {
          setFilters(update);
          setPage(1);
        }}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={students.count}
        showPageSizeSelector
      />

      <StudentList
        students={students}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        isLoading={isLoading}
        onDelete={handleDeleteOpen}
        onRowClick={handleDetailOpen}
      />

      <MyPagination
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        count={students.count}
        showPageSizeSelector={false}
      />
    </>
  );
}
