import { useQuery } from "@tanstack/react-query";
import axiosClient from "../utils/axiosClient";
import type { Country, District, Club } from "../utils/types";

export default function useCountryDistrictClub(
  countryId?: number | null,
  districtId?: number | null,
) {
  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axiosClient.get("/countries/");
      return response.data as Country[];
    },
  });

  const { data: districts = [], isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["districts", countryId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/districts/?id_country=${countryId}`,
      );
      return response.data as District[];
    },
    enabled: countryId !== null && countryId !== undefined && countryId > 0,
  });

  const { data: clubs = [], isLoading: isLoadingClubs } = useQuery({
    queryKey: ["clubs", districtId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/clubs/?id_district=${districtId}`,
      );
      return response.data as Club[];
    },
    enabled:
      districtId !== null && districtId !== undefined && districtId > 0,
  });

  return {
    countries,
    districts,
    clubs,
    isLoadingCountries,
    isLoadingDistricts,
    isLoadingClubs,
  };
}
