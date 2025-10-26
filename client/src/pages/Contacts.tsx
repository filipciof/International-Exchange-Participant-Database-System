import { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import ActionAreaCard from "../components/ActionAreaCard";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";
import Loading from "../components/Loading";
import ContactForm from "../components/ContactForm";

export type Contact = {
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
  const [open, setOpen] = useState(false);

  const handleAddContact = (contact: Contact) => {
    setContacts([...contacts, contact]);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getContacts = async () => {
    try {
      const response = await axiosClient.get("/contacts/");
      setContacts(response.data);
      setLoading(false);
      console.log(response.data);
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
      contacts.map((contact) => getImage(contact)),
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

  const getCardDescription = (contact: Contact): string[] => {
    let districtStr = "";
    for (let district of contact.districts) {
      districtStr += `${district}, `;
    }
    districtStr = districtStr.slice(0, districtStr.length - 2);
    return [contact.country, districtStr, contact.email, contact.phone];
  };

  if (loading) return <Loading />;
  if (error) return <Typography>Error: {error}</Typography>;

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleClickOpen}
      >
        New contact
      </Button>

      <ContactForm
        open={open}
        handleClose={handleClose}
        handleAddContact={handleAddContact}
      />

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
    </>
  );
}
