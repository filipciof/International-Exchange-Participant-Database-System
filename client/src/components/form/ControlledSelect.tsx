import { TextField, MenuItem, type TextFieldProps } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type Option = {
  value: string | number;
  label: string;
};

type ControlledSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: Option[];
} & Omit<TextFieldProps, "name" | "select" | "children">;

export default function ControlledSelect<T extends FieldValues>({
  name,
  control,
  options,
  ...textFieldProps
}: ControlledSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          select
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          fullWidth
          size="small"
          {...textFieldProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
