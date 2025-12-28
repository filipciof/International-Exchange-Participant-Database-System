import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../utils/axiosClient";
import { type Contact } from "../../utils/types";
import ActionAreaCard from "../ActionAreaCard";
import { Box, Skeleton } from "@mui/material";
import type { ChipProps } from "@mui/material";

export default function ContactCard({
  contact,
  onCardClick,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onCardClick: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactPhoto", contact.photo],
    queryFn: async () => {
      const photoName = contact.photo.split("/")[3];
      const response = await axiosClient.get(
        `/contacts/photos/?photo_name=${photoName}`,
        { responseType: "blob" }
      );
      return URL.createObjectURL(response.data);
    },
    enabled: !!contact.photo,
    staleTime: Infinity,
  });

  // if (isLoading) return <CircularProgress sx={{ color: "secondary.main" }} />;

  if (isLoading) {
    return (
      <Box sx={{ zoom: { xs: 0.5, sm: 0.6, md: 0.7 } }}>
        <Skeleton
          variant="rectangular"
          width={300}
          height={400}
          sx={{ borderRadius: 1, mt: "10px", mr: "10px" }}
        />
      </Box>
    );
  }

  const chips: ChipProps[] = [];
  if (contact.is_longterm) chips.push({ label: "LT", color: "primary" });
  if (contact.is_family_to_family) chips.push({label: "F2F", color: "secondary"});
  if (contact.is_camp) chips.push({label: "CAMP", color: "success"});

  return (
    <ActionAreaCard
      imageUrl={imageUrl || "/blank-profile-1024x1024.png"}
      header={`${contact.first_name} ${contact.middle_name} ${contact.last_name}`}
      description={[
        contact.country,
        contact.districts.length ? contact.districts.join(", ") : "-",
        contact.email,
        contact.phone,
        contact.gender_name,
      ]}
      chips={chips}
      onClick={() => onCardClick(contact.id)}
      onEdit={() => onEdit(contact.id)}
      onDelete={() => onDelete(contact.id)}
    />
  );
}
