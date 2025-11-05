import {
  List,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
} from "@mui/material";

type ActionAreaCardProps = {
  imageUrl: string;
  header: string;
  description: string[];
};

export default function ActionAreaCard({
  imageUrl,
  header,
  description,
}: ActionAreaCardProps) {
  return (
    <Box sx={{ zoom: { xs: 0.5, sm: 0.6, md: 0.7 } }}>
      <Card sx={{ maxWidth: "300px", mt: "10px", mr: "10px" }}>
        <CardActionArea>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={header}
            sx={{ objectFit: "fill" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {header}
            </Typography>
            <List>
                {description.map((section, index) => (
                  <Typography key={index} variant="body1">{section}</Typography>
                ))}
            </List>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
}
