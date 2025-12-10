import { Box, Paper, Typography, Divider } from "@mui/material";

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ title, icon, actions, children }: SectionProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ color: "primary.main", mr: 1, display: "flex" }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
        {actions && <Box>{actions}</Box>}
      </Box>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Paper>
  );
}
