import {
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  IconButton,
  Box,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { handleValidationErrors } from "../../utils/handleValidationErrors";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

type FormShellProps = {
  title?: string;
  onClose: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  error: any | null;
  submitButtonText?: string;
  children: ReactNode;
  variant?: "page" | "dialog";
};

export default function FormShell({
  title,
  onClose,
  onSubmit,
  isLoading,
  isSuccess,
  error,
  submitButtonText,
  children,
  variant = "page",
}: FormShellProps) {
  const { t } = useTranslation();
  const isDialog = variant === "dialog";

  const form = (
    <form noValidate onSubmit={onSubmit}>
      <Stack spacing={1} sx={isDialog ? { p: 2 } : { px: { xs: 0, md: 16 } }}>
        {children}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ pt: 2 }}
        >
          <Button variant="outlined" onClick={onClose} size="large">
            {t("common.cancel")}
          </Button>
          {isLoading ? (
            <CircularProgress sx={{ color: "secondary.main" }} />
          ) : (
            <Button variant="contained" type="submit" size="large">
              {submitButtonText || t("common.submit")}
            </Button>
          )}
        </Stack>
        {error && (
          <Stack spacing={1}>
            {handleValidationErrors(error.response?.data).map(
              (errorMessage: string, index: number) => (
                <Typography key={index} sx={{ color: "error.main" }}>
                  {errorMessage}
                </Typography>
              ),
            )}
          </Stack>
        )}
        {isSuccess && (
          <Typography sx={{ color: "success.main" }}>
            {t("common.success")}
          </Typography>
        )}
      </Stack>
    </form>
  );

  if (isDialog) {
    return form;
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Paper elevation={0}>
        {title && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 3 }}
          >
            <IconButton onClick={onClose} edge="start">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {title}
            </Typography>
          </Stack>
        )}
        {form}
      </Paper>
    </Box>
  );
}
