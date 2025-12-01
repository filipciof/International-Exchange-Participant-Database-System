import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import StudentList from "../components/students/StudentList";
import Loading from "../components/Loading";
import { Typography } from "@mui/material";
import MyPagination from "../components/MyPagination";
import type { Student, ViewType } from "../utils/types";
import StudentDetail from "../components/students/StudentDetail";

export default function Students() {
  const [currentView, setCurrentView] = useState<ViewType>("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 1,
    pageSize: 25,
  });
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
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students", paginationModel],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: paginationModel.page.toString(),
        page_size: paginationModel.pageSize.toString(),
      });

      const response = await axiosClient.get(`/students/?${params.toString()}`);
      console.log(response.data);
      return response.data;
    },
  });

  if (isLoading) return <Loading />;
  if (error)
    return (
      <Typography sx={{ color: "error.main" }}>
        Error: {error.message}
      </Typography>
    );

  const handleClose = () => {
    setSelectedStudent(null);
    handleViewChange("list");
  };

  const handleDetailOpen = (student: Student) => {
    setSelectedStudent(student);
    handleViewChange("detail");
  };
  
  if (currentView === "detail" && selectedStudent) {
      return (
        <StudentDetail student={selectedStudent} handleClose={handleClose} />
      );
    }

  return (
    <>
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
        onEdit={() => {}}
        onDelete={() => {}}
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
