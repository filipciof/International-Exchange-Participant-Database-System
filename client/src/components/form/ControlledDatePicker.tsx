import { DatePicker, type DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type ControlledDatePickerProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
} & Omit<DatePickerProps, "value" | "onChange">;

export default function ControlledDatePicker<T extends FieldValues>({
  name,
  control,
  ...datePickerProps
}: ControlledDatePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          value={field.value ? dayjs(field.value) : null}
          onChange={(date) => {
            field.onChange(date ? date.format("YYYY-MM-DD") : "");
          }}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: "small",
              fullWidth: true,
              error: !!error,
              helperText: error?.message,
            },
          }}
          {...datePickerProps}
        />
      )}
    />
  );
}
