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
  is_longterm: boolean;
  is_family_to_family: boolean;
  is_camp: boolean;
};

export default function ActionAreaCard({
  imageUrl,
  header,
  description,
  is_longterm,
  is_family_to_family,
  is_camp,
}: ActionAreaCardProps) {
  return (
<Box sx={{ zoom: { xs: 0.5, sm: 0.6, md: 0.7 } }}>
      <Card sx={{ maxWidth: "300px", mt: "10px", mr: "10px", position: 'relative' }}>
        <CardActionArea>
          <Box position="relative">
            <CardMedia
              component="img"
              image={imageUrl}
              alt={header}
              sx={{ objectFit: "cover" }}
            />
            {/* Render Chips over the image */}
            <Box
              position="absolute"
              bottom={16}
              right={16}
              display="flex"
              flexDirection="column"
              gap={1}
            >
              {is_longterm && <Chip label="LT" color="secondary" />}
              {is_family_to_family && <Chip label="F2F" color="secondary" />}
              {is_camp && <Chip label="CAMP" color="secondary" />}
            </Box>
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
