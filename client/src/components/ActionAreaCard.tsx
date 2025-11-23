import { useState } from "react";
import type { MouseEvent } from "react";
import {
  List,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type ActionAreaCardProps = {
  imageUrl: string;
  header: string;
  description: string[];
  chips?: string[];
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ActionAreaCard({
  imageUrl,
  header,
  description,
  chips = [],
  onClick,
  onEdit,
  onDelete,
}: ActionAreaCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMenuClose();
    onEdit?.();
  };

  const handleDelete = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleMenuClose();
    onDelete?.();
  };

  return (
    <Box sx={{ zoom: { xs: 0.5, sm: 0.6, md: 0.7 } }}>
      <Card
        sx={{ maxWidth: "300px", mt: "10px", mr: "10px", position: "relative" }}
      >
        <IconButton
          aria-label="more"
          aria-controls={open ? "card-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleMenuClick}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1,
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            padding: 0.5,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
            },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 40 }} />
        </IconButton>

        <Menu
          id="card-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleMenuClose()}
          slotProps={{
            list: {
              "aria-labelledby": "more-button",
            },
          }}
        >
          {onEdit && <MenuItem onClick={handleEdit}>Edit</MenuItem>}
          {onDelete && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
        </Menu>
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
