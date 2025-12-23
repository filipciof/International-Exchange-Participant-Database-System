import { useEffect, useRef } from "react";
import StudentList from "../components/students/StudentList";
import Loading from "../components/Loading";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import MyPagination from "../components/MyPagination";
import type { StudentFormData, ViewType } from "../utils/types";
import StudentDetail from "../components/students/StudentDetail";
import AddStudent from "../components/students/StudentAdd";
import UpdateStudent from "../components/students/StudentUpdate";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import { useStudents } from "../hooks/useStudents";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import StudentFilter from "../components/students/StudentFilter";
import { useQueryState } from "nuqs";
import {
  parseAsStringLiteral,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";

export default function Students() {
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

  // Search
  const [searchInput, setSearchInput] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [searchFields, setSearchFields] = useQueryState(
    "searchFields",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  // Filters
  const [selectedCountryOfDepartureId, setSelectedCountryOfDepartureId] =
    useQueryState("countryOfDeparture", parseAsInteger);
  const [selectedCountryOfBirthId, setSelectedCountryOfBirthId] = useQueryState(
    "countryOfBirth",
    parseAsInteger,
  );
  const [selectedCountryOfPassportId, setSelectedCountryOfPassportId] =
    useQueryState("countryOfPassport", parseAsInteger);
  const [selectedShirtSizes, setSelectedShirtSizes] = useQueryState(
    "shirtSizes",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [selectedGenders, setSelectedGenders] = useQueryState(
    "genders",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );
  const [selectedStartYear, setSelectedStartYear] = useQueryState(
    "startYear",
    parseAsInteger,
  );
  const [isInboundParam, setIsInboundParam] = useQueryState(
    "isInbound",
    parseAsStringLiteral(["true", "false", "both"]).withDefault("true"),
  );
  const isInbound =
    isInboundParam === "both" ? null : isInboundParam === "true";

  // Date filters
  const [dateOfBirthBefore, setDateOfBirthBefore] = useQueryState(
    "dateOfBirthBefore",
    parseAsString.withDefault(""),
  );
  const [dateOfBirthAfter, setDateOfBirthAfter] = useQueryState(
    "dateOfBirthAfter",
    parseAsString.withDefault(""),
  );
  const [passportExpirationDateBefore, setPassportExpirationDateBefore] =
    useQueryState("passportExpBefore", parseAsString.withDefault(""));
  const [passportExpirationDateAfter, setPassportExpirationDateAfter] =
    useQueryState("passportExpAfter", parseAsString.withDefault(""));

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
    countries,
    isLoading,
    error,
    addStudentMutation,
    updateStudentMutation,
    deleteStudentMutation,
    exportStudentsMutation,
  } = useStudents({
    paginationModel,
    selectedCountryOfDepartureId,
    selectedCountryOfBirthId,
    selectedCountryOfPassportId,
    selectedGenders,
    selectedShirtSizes,
    selectedStartYear,
    isInbound,
    searchFields,
    searchInput,
    dateOfBirthBefore,
    dateOfBirthAfter,
    passportExpirationDateBefore,
    passportExpirationDateAfter,
  });

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
        Error: {error.message}
      </Typography>
    );

  const handleClose = () => {
    setSelectedId(null);
    addStudentMutation.reset();
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

  const handleAddStudent = (student: StudentFormData) => {
    addStudentMutation.mutate(student);
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

  const handleUpdateOpen = (id: number) => {
    setSelectedId(id);
    handleViewChange("update");
  };

  const handleUpdateStudent = (data: StudentFormData) => {
    if (selectedId) {
      updateStudentMutation.mutate({ id: selectedId, data });
    }
  };

  if (currentView === "detail" && selectedId) {
    return <StudentDetail id={selectedId} handleClose={handleClose} />;
  }

  if (currentView === "add") {
    return (
      <AddStudent
        handleClose={handleClose}
        handleAddStudent={handleAddStudent}
        isLoading={addStudentMutation.isPending}
        isSuccess={addStudentMutation.isSuccess}
        error={addStudentMutation.error}
        countries={countries}
      />
    );
  }

  if (currentView === "update" && selectedId) {
    return (
      <UpdateStudent
        handleClose={handleClose}
        handleUpdateStudent={handleUpdateStudent}
        isLoading={updateStudentMutation.isPending}
        isSuccess={updateStudentMutation.isSuccess}
        error={updateStudentMutation.error}
        countries={countries}
        id={selectedId}
      />
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddOpen}
        >
          New student
        </Button>

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
            {exportStudentsMutation.isPending ? "Exporting..." : "Export as CSV"}
          </Button>

          <Button
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
          </Button>
        </Box>
      </Box>

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
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        searchFields={searchFields}
        setSearchFields={setSearchFields}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        selectedCountryOfDeparture={
          countries.find((c) => c.id === selectedCountryOfDepartureId) || null
        }
        setSelectedCountryOfDeparture={(country) =>
          setSelectedCountryOfDepartureId(country?.id || null)
        }
        selectedCountryOfBirth={
          countries.find((c) => c.id === selectedCountryOfBirthId) || null
        }
        setSelectedCountryOfBirth={(country) =>
          setSelectedCountryOfBirthId(country?.id || null)
        }
        selectedCountryOfPassport={
          countries.find((c) => c.id === selectedCountryOfPassportId) || null
        }
        setSelectedCountryOfPassport={(country) =>
          setSelectedCountryOfPassportId(country?.id || null)
        }
        selectedShirtSizes={selectedShirtSizes}
        setSelectedShirtSizes={setSelectedShirtSizes}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
        selectedStartYear={selectedStartYear}
        setSelectedStartYear={setSelectedStartYear}
        isInbound={isInbound}
        setIsInbound={(value) =>
          setIsInboundParam(value === null ? "both" : value ? "true" : "false")
        }
        dateOfBirthBefore={dateOfBirthBefore}
        setDateOfBirthBefore={setDateOfBirthBefore}
        dateOfBirthAfter={dateOfBirthAfter}
        setDateOfBirthAfter={setDateOfBirthAfter}
        passportExpirationDateBefore={passportExpirationDateBefore}
        setPassportExpirationDateBefore={setPassportExpirationDateBefore}
        passportExpirationDateAfter={passportExpirationDateAfter}
        setPassportExpirationDateAfter={setPassportExpirationDateAfter}
        countries={countries}
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
        onEdit={handleUpdateOpen}
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
