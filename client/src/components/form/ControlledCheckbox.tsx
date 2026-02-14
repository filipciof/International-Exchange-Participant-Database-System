import { FormControlLabel, Checkbox } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type ControlledCheckboxProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label: string;
};

export default function ControlledCheckbox<T extends FieldValues>({
  name,
  control,
  label,
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={field.value ?? false}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          }
          label={label}
        />
      )}
    />
  );
}
