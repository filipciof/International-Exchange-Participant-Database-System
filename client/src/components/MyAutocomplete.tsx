import * as React from "react";
import { Autocomplete, TextField, CircularProgress, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";

type MyAutocompleteProps<T extends { id: number }> = {
  initialId: number | null | undefined;
  handleChange: (item: T) => void;
  label: string;
  endpoint: string;
  getOptionLabel: (item: T) => string;
  searchParam?: string;
  params?: Record<string, string>;
};

export default function MyAutocomplete<T extends { id: number }>({
  initialId,
  handleChange,
  label,
  endpoint,
  getOptionLabel,
  searchParam = "search",
  params,
}: MyAutocompleteProps<T>) {
  /* -------------------------------------------------
   * State
   * ------------------------------------------------- */
  const [value, setValue] = React.useState<T | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [options, setOptions] = React.useState<T[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const listboxRef = React.useRef<HTMLUListElement | null>(null);
  const scrollTopRef = React.useRef(0);
  const hasSetInitialValue = React.useRef(false);

  /* -------------------------------------------------
   * Initial item (single entity)
   * ------------------------------------------------- */
  const { data: initialItem } = useQuery<T>({
    queryKey: [endpoint, initialId, params],
    enabled: !!initialId,
    queryFn: async () => {
      const searchParams = new URLSearchParams({ id: String(initialId) });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
      }
      const res = await axiosClient.get(
        `/${endpoint}/?${searchParams.toString()}`,
      );
      return res.data;
    },
  });

  React.useEffect(() => {
    if (initialItem && !hasSetInitialValue.current) {
      setValue(initialItem);
      setOptions((prev) =>
        prev.some((o) => o.id === initialItem.id)
          ? prev
          : [initialItem, ...prev],
      );
      hasSetInitialValue.current = true;
    }
  }, [initialItem]);

  /* -------------------------------------------------
   * Item search (paginated)
   * ------------------------------------------------- */
  const { data, isFetching } = useQuery({
    queryKey: [endpoint, search, page, params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        page_size: "25",
      });
      if (search) searchParams.append(searchParam, search);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value);
        });
      }

      const res = await axiosClient.get(
        `/${endpoint}/?${searchParams.toString()}`,
      );
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
    <Autocomplete<T>
      value={value}
      inputValue={inputValue}
      options={options}
      loading={isFetching && page === 1}
      filterOptions={(x) => x}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      getOptionLabel={getOptionLabel}
      slots={{ listbox: ListboxComponent }}
      onChange={(_, newValue) => {
        setValue(newValue);
        if (newValue) {
          handleChange(newValue);
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
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isFetching && page === 1 && <CircularProgress size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
