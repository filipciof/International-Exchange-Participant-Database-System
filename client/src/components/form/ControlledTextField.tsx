import { TextField, type TextFieldProps } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type ControlledTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<TextFieldProps, "name">;

export default function ControlledTextField<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: ControlledTextFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          fullWidth
          size="small"
          {...textFieldProps}
        />
      )}
    />
  );
}
