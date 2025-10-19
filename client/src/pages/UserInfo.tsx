import Button from "@mui/material/Button";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UserInfo() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axiosClient.post("/auth/logout/");
      localStorage.clear();
      navigate("/sign-in");
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <>
      <p>{localStorage.getItem("userEmail")}</p>
      <Button variant="contained" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );
}
