import * as React from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import type { Staff } from "../utils/types";

type StaffAutocompleteProps = {
  initialStaffId: number | null;
  handleStaffChange: (staff: Staff) => void;
  label: string;
};

export default function StaffAutocomplete({
  initialStaffId,
  handleStaffChange,
  label,
}: StaffAutocompleteProps) {
  /* -------------------------------------------------
   * State
   * ------------------------------------------------- */
  const [value, setValue] = React.useState<Staff | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [options, setOptions] = React.useState<Staff[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const listboxRef = React.useRef<HTMLUListElement | null>(null);
  const scrollTopRef = React.useRef(0);

  /* -------------------------------------------------
   * Initial staff (single entity)
   * ------------------------------------------------- */
  const { data: initialStaff } = useQuery<Staff>({
    queryKey: ["staff", initialStaffId],
    enabled: !!initialStaffId,
    queryFn: async () => {
      const res = await axiosClient.get(`/staff/?id=${initialStaffId}`);
      return res.data;
    },
  });

  React.useEffect(() => {
    if (initialStaff && !value) {
      setValue(initialStaff);
      setOptions((prev) =>
        prev.some((o) => o.id === initialStaff.id)
          ? prev
          : [initialStaff, ...prev],
      );
    }
  }, [initialStaff, value]);

  /* -------------------------------------------------
   * Staff search (paginated)
   * ------------------------------------------------- */
  const { data, isFetching } = useQuery({
    queryKey: ["staff-search", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "25",
      });
      if (search) params.append("search", search);

      const res = await axiosClient.get(`/staff/?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (!data) return;

    setOptions((prev) =>
      page === 1 ? data.results : [...prev, ...data.results],
    );
    setHasMore(Boolean(data.next));
  }, [data, page]);

  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [search]);

  /* -------------------------------------------------
   * Restore scroll position after options update
   * ------------------------------------------------- */
  React.useLayoutEffect(() => {
    if (listboxRef.current) {
      listboxRef.current.scrollTop = scrollTopRef.current;
    }
  }, [options.length]);

  /* -------------------------------------------------
   * Custom MUI-compliant Listbox
   * ------------------------------------------------- */
  const ListboxComponent = React.useMemo(
    () =>
      React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLElement>>(
        function Listbox(props, ref) {
          const { children, ...other } = props;

          return (
            <ul
              ref={(node) => {
                listboxRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
              }}
              {...other}
              style={{
                maxHeight: 300,
                overflow: "auto",
                padding: 0,
                margin: 0,
              }}
              onScroll={(e) => {
                const node = e.currentTarget;

                scrollTopRef.current = node.scrollTop;

                if (
                  node.scrollTop + node.clientHeight >=
                  node.scrollHeight - 1
                ) {
                  if (hasMore && !isFetching) {
                    setPage((p) => p + 1);
                  }
                }
              }}
            >
              {children}
              {hasMore && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </ul>
          );
        },
      ),
    [hasMore, isFetching],
  );

  /* -------------------------------------------------
   * Render
   * ------------------------------------------------- */
  return (
    <Autocomplete<Staff>
      value={value}
      inputValue={inputValue}
      options={options}
      loading={isFetching && page === 1}
      filterOptions={(x) => x}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      getOptionLabel={(o) => `${o.first_name} ${o.last_name}`}
      slots={{ listbox: ListboxComponent }}
      onChange={(_, newValue) => {
        setValue(newValue);
        if (newValue) {
          handleStaffChange(newValue);
        }
      }}
      onInputChange={(_, newInput, reason) => {
        setInputValue(newInput);
        if (reason === "input") {
          setSearch(newInput);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching && page === 1 && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
