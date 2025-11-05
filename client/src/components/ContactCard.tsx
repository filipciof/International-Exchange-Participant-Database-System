import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import { type Contact } from "../pages/Contacts";
import ActionAreaCard from "./ActionAreaCard";
import { CircularProgress } from "@mui/material";

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

  if (isLoading) return <CircularProgress sx={{ color: "secondary.main" }} />;

  return (
    <ActionAreaCard
      imageUrl={imageUrl || ""}
      header={`${contact.first_name} ${contact.last_name}`}
      description={[
        contact.country,
        contact.districts.join(", "),
        contact.email,
        contact.phone,
      ]}
    />
  );
}
