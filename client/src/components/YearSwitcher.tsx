import { useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useYear } from "../hooks/useYear";
import { useTranslation } from "react-i18next";
import { handleValidationErrors } from "../utils/handleValidationErrors";

export default function YearSwitcher() {
  const { t } = useTranslation();

  const {
    years,
    setCurrentYear,
    isSettingCurrentYear,
    createYear,
    isCreatingYear,
    createYearError,
    resetCreateYear,
    updateYear,
    isUpdatingYear,
    updateYearError,
    resetUpdateYear,
    deleteYear,
    isDeletingYear,
  } = useYear();
  const yearRegex = /^\d{4}\/\d{2}$/;
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingCurrentYearId, setPendingCurrentYearId] = useState<number | null>(null);
  const [pendingDeleteYearId, setPendingDeleteYearId] = useState<number | null>(null);

  const handleAdd = () => {
    if (!yearRegex.test(newValue.trim())) return;
    createYear(newValue.trim(), {
      onSuccess: () => {
        setAdding(false);
        setNewValue("");
      },
    });
  };

  const handleEdit = (id: number) => {
    if (!yearRegex.test(editValue.trim())) return;
    updateYear(
      { id, value: editValue },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditValue("");
        },
      },
    );
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {adding ? (
        <>
        <Box sx={{ display: "flex", alignItems: "center", px: 1, py: 0.25 }}>
          <Box sx={{ width: 20 }} />
          <TextField
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            size="small"
            placeholder="2025/26"
            error={newValue.length > 0 && !yearRegex.test(newValue)}
            sx={{ width: 90 }}
            slotProps={{ htmlInput: { maxLength: 7 } }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewValue("");
              }
            }}
            autoFocus
          />
          <IconButton
            size="small"
            onClick={handleAdd}
            color="primary"
            sx={{ ml: "auto" }}
            disabled={isCreatingYear}
          >
            {isCreatingYear ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setAdding(false);
              setNewValue("");
              resetCreateYear();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {createYearError && (
          <Stack sx={{ px: 1 }}>
            {handleValidationErrors((createYearError as any).response?.data).map(
              (msg: string, i: number) => (
                <Typography key={i} variant="caption" sx={{ color: "error.main" }}>
                  {msg}
                </Typography>
              ),
            )}
          </Stack>
        )}
        </>
      ) : (
        <IconButton
          size="small"
          onClick={() => setAdding(true)}
          sx={{ ml: 1, borderRadius: 1 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      )}
      <List dense disablePadding sx={{ overflowY: "auto", maxHeight: 300 }}>
        {years.map((year) => (
          <ListItem key={year.id} disablePadding sx={{ display: "block" }}>
            {editingId === year.id ? (
              <>
              <Box
                sx={{ display: "flex", alignItems: "center", px: 1, py: 0.25 }}
              >
                <Box sx={{ width: 20 }} />
                <TextField
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  size="small"
                  error={editValue.length > 0 && !yearRegex.test(editValue)}
                  sx={{ width: 90 }}
                  slotProps={{ htmlInput: { maxLength: 7 } }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit(year.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                />
                <IconButton
                  size="small"
                  onClick={() => handleEdit(year.id)}
                  color="primary"
                  sx={{ ml: "auto" }}
                  disabled={isUpdatingYear}
                >
                  {isUpdatingYear ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingId(null);
                    resetUpdateYear();
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              {updateYearError && (
                <Stack sx={{ px: 1 }}>
                  {handleValidationErrors((updateYearError as any).response?.data).map(
                    (errorMessage: string, index: number) => (
                      <Typography key={index} variant="caption" sx={{ color: "error.main" }}>
                        {errorMessage}
                      </Typography>
                    ),
                  )}
                </Stack>
              )}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: year.is_current ? "action.selected" : "transparent",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: "pointer",
                    flex: 1,
                    "&:hover": { opacity: 0.8 },
                  }}
                  onClick={() => {
                    setPendingCurrentYearId(year.id);
                    setCurrentYear(year.id, { onSettled: () => setPendingCurrentYearId(null) });
                  }}
                >
                  {isSettingCurrentYear && pendingCurrentYearId === year.id ? (
                    <CircularProgress size={16} />
                  ) : year.is_current ? (
                    <CheckIcon fontSize="small" color="primary" />
                  ) : (
                    <Box sx={{ width: 20 }} />
                  )}
                  <Typography variant="body2">{year.value}</Typography>
                </Box>
                <Box>
                  <Tooltip title={t("common.edit")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingId(year.id);
                        setEditValue(year.value);
                      }}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("common.delete")}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setPendingDeleteYearId(year.id);
                        deleteYear(year.id, { onSettled: () => setPendingDeleteYearId(null) });
                      }}
                      color="error"
                      disabled={isDeletingYear && pendingDeleteYearId === year.id}
                    >
                      {isDeletingYear && pendingDeleteYearId === year.id ? (
                        <CircularProgress size={16} color="error" />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
