import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import { type Contact } from "../utils/types";
import ActionAreaCard from "./ActionAreaCard";
import { Box, CircularProgress, Skeleton } from "@mui/material";

export default function ContactCard({ contact }: { contact: Contact }) {
  const { data: imageUrl, isLoading } = useQuery({
    queryKey: ["contactImage", contact.photo],
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

  return (
    <ActionAreaCard
      imageUrl={imageUrl || ""}
      header={`${contact.first_name} ${contact.middle_name} ${contact.last_name}`}
      description={[
        contact.country,
        contact.districts.length ? contact.districts.join(", "): "-",
        contact.email,
        contact.phone,
        contact.gender,
        contact.notes,
      ]}
      is_longterm={contact.is_longterm}
      is_family_to_family={contact.is_family_to_family}
      is_camp={contact.is_camp}
    />
  );
}
