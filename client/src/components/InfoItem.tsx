import { Box, Grid, Typography, Link } from "@mui/material";

type InfoItemProps = {
  label: string;
  value: string | number | null | undefined;
  linkPath?: string | null;
  fullWidth?: boolean;
};

export default function InfoItem({
  label,
  value,
  linkPath,
  fullWidth = false,
}: InfoItemProps) {
  const displayValue = value?.toString() || "—";

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6 }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {linkPath ? (
            <Link
              href={linkPath}
              underline="hover"
              sx={{ cursor: "pointer" }}
            >
              {displayValue}
            </Link>
          ) : (
            displayValue
          )}
        </Typography>
      </Box>
    </Grid>
  );
}
