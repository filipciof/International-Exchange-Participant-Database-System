import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import ActionAreaCard from "../components/ActionAreaCard";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, CssBaseline } from "@mui/material";

type Contact = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  districts: string[];
  photo: string;
};

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getContacts = async () => {
    try {
      const response = await axiosClient.get("/contacts/");
      setContacts(response.data);
      setLoading(false);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }

    return [];
  };

  const getImage = async (contact: Contact) => {
    const photoName = contact.photo.split("/")[3];
    const requestUrl = `/contacts/photos/?photo_name=${photoName}`;

    try {
      const response = await axiosClient.get(requestUrl, {
        responseType: "blob",
      });
      const image = URL.createObjectURL(response.data);
      return image;
    } catch (err: any) {
      setError(err.message);
      return "";
    }
  };

  const fetchImages = async () => {
    const fetchedImages = await Promise.all(
      contacts.map((contact) => getImage(contact))
    );
    setImages(fetchedImages);
  };

  useEffect(() => {
    getContacts();
  }, []);

  useEffect(() => {
    if (contacts.length == 0) {
      return;
    }
    fetchImages();
  }, [contacts]);

  const getCardHeader = (contact: Contact) => {
    return `${contact.first_name} ${contact.last_name}`;
  };

  const getCardDescription = (contact: Contact) => {
    return (
      contact.country +
      "\n" +
      contact.districts +
      "\n" +
      contact.email +
      "\n" +
      contact.phone
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box>
      <CssBaseline enableColorScheme />
      <Box style={{textAlign: "left", paddingTop: "5vh", paddingLeft: "3.5vw"}}>
        <Button variant="outlined" startIcon={<AddIcon />}>
          New contact
        </Button>
      </Box>
      <Box style={{ display: "flex", flexWrap: "wrap" }}>
        {contacts.map((contact, index) => (
          <ActionAreaCard
            key={index}
            imageUrl={images[index]}
            header={getCardHeader(contact)}
            description={getCardDescription(contact)}
          />
        ))}
      </Box>
    </Box>
  );
}
