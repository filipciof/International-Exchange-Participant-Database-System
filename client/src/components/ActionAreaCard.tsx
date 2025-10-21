import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

type ActionAreaCardProps = {
  imageUrl: string;
  header: string;
  description: string;
};

export default function ActionAreaCard({
  imageUrl,
  header,
  description,
}: ActionAreaCardProps) {
  return (
    <div
      style={{
        transform: `scale(${0.7})`,
        transition: "transform 0.3s ease",
      }}
    >
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            // height="140"
            image={imageUrl}
            alt={header}
            sx={{ objectFit: "fill" }}
          />
          <CardContent>
            <Typography gutterBottom variant="h4" component="div">
              {header}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  );
}
