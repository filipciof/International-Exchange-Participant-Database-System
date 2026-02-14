import {
  Autocomplete,
  TextField,
  CircularProgress,
  type TextFieldProps,
} from "@mui/material";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type ControlledAutocompleteProps<T extends FieldValues, Option> = {
  name: Path<T>;
  control: Control<T>;
  options: Option[];
  getOptionLabel: (option: Option) => string;
  getOptionValue: (option: Option) => number | string;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  textFieldProps?: Omit<TextFieldProps, "label">;
};

export default function ControlledAutocomplete<
  T extends FieldValues,
  Option,
>({
  name,
  control,
  options,
  getOptionLabel,
  getOptionValue,
  label,
  loading,
  disabled,
  textFieldProps,
}: ControlledAutocompleteProps<T, Option>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          value={options.find((o) => getOptionValue(o) === field.value) || null}
          onChange={(_event, newValue) => {
            field.onChange(newValue ? getOptionValue(newValue) : undefined);
          }}
          options={options}
          getOptionLabel={getOptionLabel}
          loading={loading}
          disabled={disabled}
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!error}
              helperText={error?.message}
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                },
              }}
              {...textFieldProps}
            />
          )}
        />
      )}
    />
  );
}
