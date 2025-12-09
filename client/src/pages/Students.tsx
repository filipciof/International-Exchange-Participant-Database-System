import { useState, useEffect, useRef } from "react";
import StudentList from "../components/students/StudentList";
import Loading from "../components/Loading";
import { Box, Button, Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import type {
  Student,
  StudentFormData,
  ViewType,
  Country,
} from "../utils/types";
import StudentDetail from "../components/students/StudentDetail";
import AddStudent from "../components/students/StudentAdd";
import UpdateStudent from "../components/students/StudentUpdate";
import AddIcon from "@mui/icons-material/Add";
import { useStudents } from "../hooks/useStudents";
import DeleteConfirmationDialog from "../components/DeleteConfirmationDialog";
import StudentFilter from "../components/students/StudentFilter";

export default function Students() {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 25,
  });
  const [selectedCountryOfDeparture, setSelectedCountryOfDeparture] =
    useState<Country | null>(null);
  const [selectedCountryOfBirth, setSelectedCountryOfBirth] =
    useState<Country | null>(null);
  const [selectedCountryOfPassport, setSelectedCountryOfPassport] =
    useState<Country | null>(null);
  const [selectedShirtSizes, setSelectedShirtSizes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<number[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
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
  } = useStudents({
    paginationModel,
    selectedCountryOfDeparture,
    selectedCountryOfBirth,
    selectedCountryOfPassport,
    selectedGenders,
    selectedShirtSizes,
    searchFields,
    searchInput,
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
    setSelectedStudent(null);
    addStudentMutation.reset();
    deleteStudentMutation.reset();
    updateStudentMutation.reset();
    handleViewChange("list");
  };

  const handleDetailOpen = (student: Student) => {
    setSelectedStudent(student);
    handleViewChange("detail");
  };

  const handleAddOpen = () => {
    handleViewChange("add");
  };

  const handleAddStudent = (student: StudentFormData) => {
    addStudentMutation.mutate(student);
  };

  const handleDeleteOpen = (student: Student) => {
    setSelectedStudent(student);
    handleViewChange("delete");
  };

  const handleDeleteStudent = (student: Student) => {
    if (selectedStudent) {
      deleteStudentMutation.mutate(student.id);
    }
  };

  const handleUpdateOpen = (student: Student) => {
    setSelectedStudent(student);
    handleViewChange("update");
  };

  const handleUpdateStudent = (data: StudentFormData) => {
    if (selectedStudent) {
      updateStudentMutation.mutate({ id: selectedStudent.id, data });
    }
  };

  if (currentView === "detail" && selectedStudent) {
    return (
      <StudentDetail student={selectedStudent} handleClose={handleClose} />
    );
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

  if (currentView === "update" && selectedStudent) {
    return (
      <UpdateStudent
        handleClose={handleClose}
        handleUpdateStudent={handleUpdateStudent}
        isLoading={updateStudentMutation.isPending}
        isSuccess={updateStudentMutation.isSuccess}
        error={updateStudentMutation.error}
        countries={countries}
        student={selectedStudent}
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
      </Box>

      {selectedStudent && (
        <DeleteConfirmationDialog
          open={currentView === "delete"}
          handleClose={handleClose}
          isLoading={deleteStudentMutation.isPending}
          isSuccess={deleteStudentMutation.isSuccess}
          error={deleteStudentMutation.error}
          onConfirm={() => handleDeleteStudent(selectedStudent)}
        />
      )}

      <StudentFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        searchFields={searchFields}
        setSearchFields={setSearchFields}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        selectedCountryOfDeparture={selectedCountryOfDeparture}
        setSelectedCountryOfDeparture={setSelectedCountryOfDeparture}
        selectedCountryOfBirth={selectedCountryOfBirth}
        setSelectedCountryOfBirth={setSelectedCountryOfBirth}
        selectedCountryOfPassport={selectedCountryOfPassport}
        setSelectedCountryOfPassport={setSelectedCountryOfPassport}
        selectedShirtSizes={selectedShirtSizes}
        setSelectedShirtSizes={setSelectedShirtSizes}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
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
