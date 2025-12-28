import { Box, Grid, Typography } from "@mui/material";

type InfoItemProps = {
  label: string;
  value: string | number | Date | null | undefined;
  fullWidth?: boolean;
};

export default function InfoItem({ label, value, fullWidth = false }: InfoItemProps) {
  const displayValue = value
    ? value instanceof Date
      ? value.toLocaleDateString()
      : value
    : "—";

  return (
    <Grid size={{ xs: 12, sm: fullWidth ? 12 : 6, md: fullWidth ? 12 : 4 }}>
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {displayValue}
        </Typography>
      </Box>
    </Grid>
  );
}
