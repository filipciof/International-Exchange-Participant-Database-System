import {
  Box,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";
import type { PaginationModel } from "../utils/types";

type MyPaginationProps = {
  paginationModel: PaginationModel,
  setPaginationModel: (model: PaginationModel) => void;
  count: number;
  showPageSizeSelector: boolean;
};

export default function MyPagination({
  paginationModel,
  setPaginationModel,
  count,
  showPageSizeSelector = true,
}: MyPaginationProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: 2,
        my: 3,
      }}
    >
      {showPageSizeSelector && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Results per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={paginationModel.pageSize}
              onChange={(e) =>
                setPaginationModel({
                  page: 1,
                  pageSize: Number(e.target.value),
                })
              }
              sx={{ minWidth: 70 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
      <Pagination
        count={Math.ceil(count / paginationModel.pageSize)}
        page={paginationModel.page}
        onChange={(_, page) =>
          setPaginationModel({
            ...paginationModel,
            page: page,
          })
        }
        showFirstButton
        showLastButton
        color="secondary"
        variant="outlined"
        shape="rounded"
        siblingCount={0}
        sx={{
          "& .MuiPagination-ul": {
            flexWrap: "nowrap",
          },
        }}
      />
    </Box>
  );
}
