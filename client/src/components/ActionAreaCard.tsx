import {
  List,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  Chip,
} from "@mui/material";

type ActionAreaCardProps = {
  imageUrl: string;
  header: string;
  description: string[];
  chips?: string[];
  onClick?: () => void;
};

export default function ActionAreaCard({
  imageUrl,
  header,
  description,
  chips = [],
  onClick,
}: ActionAreaCardProps) {
  return (
    <Box sx={{ zoom: { xs: 0.5, sm: 0.6, md: 0.7 } }}>
      <Card
        sx={{ maxWidth: "300px", mt: "10px", mr: "10px", position: "relative" }}
      >
        <CardActionArea onClick={onClick}>
          <Box position="relative">
            <CardMedia
              component="img"
              image={imageUrl}
              alt={header}
              sx={{ objectFit: "cover" }}
            />
            {chips.length > 0 && (
              <Box
                position="absolute"
                bottom={16}
                right={16}
                display="flex"
                flexDirection="row"
                gap={1}
              >
                {chips.map((label, index) => (
                  <Chip key={index} label={label} color="secondary" />
                ))}
              </Box>
            )}
          </Box>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {header}
            </Typography>
            <List>
              {description.map((section, index) => (
                <Typography key={index} variant="body1">
                  {section}
                </Typography>
              ))}
            </List>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
