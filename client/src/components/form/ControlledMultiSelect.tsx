import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  Box,
  Chip,
  type SelectChangeEvent,
} from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type Option = {
  value: string;
  label: string;
};

type ControlledMultiSelectProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  options: Option[];
  label: string;
  required?: boolean;
  disabled?: boolean;
};

export default function ControlledMultiSelect<T extends FieldValues>({
  name,
  control,
  options,
  label,
  required,
  disabled,
}: ControlledMultiSelectProps<T>) {
  const labelId = `${name}-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth
          required={required}
          size="small"
          error={!!error}
          disabled={disabled}
        >
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select<string[]>
            labelId={labelId}
            multiple
            value={field.value}
            label={label}
            onChange={(e: SelectChangeEvent<string[]>) =>
              field.onChange(e.target.value as string[])
            }
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((val) => {
                  const option = options.find((o) => o.value === val);
                  return (
                    <Chip
                      key={val}
                      label={option?.label ?? val}
                      size="small"
                    />
                  );
                })}
              </Box>
            )}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
