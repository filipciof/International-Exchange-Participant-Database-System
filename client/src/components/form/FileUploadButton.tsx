import { Button } from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";

type FileUploadButtonProps = {
  file: File | null;
  onChange: (file: File) => void;
  label: string;
  accept?: string;
};

export default function FileUploadButton({
  file,
  onChange,
  label,
  accept = "image/*",
}: FileUploadButtonProps) {
  return (
    <Button
      variant="outlined"
      component="label"
      startIcon={<CloudUploadIcon />}
      fullWidth
    >
      {file ? file.name : label}
      <input
        type="file"
        hidden
        accept={accept}
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) onChange(selected);
        }}
      />
    </Button>
  );
}
