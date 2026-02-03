import { useQuery } from "@tanstack/react-query";
import { refreshAccessToken } from "../utils/axiosClient";

const FIVE_MINUTES = 5 * 60 * 1000;

export default function useTokenRefresh(enabled: boolean) {
  return useQuery({
    queryKey: ["tokenRefresh"],
    queryFn: refreshAccessToken,
    enabled,
    refetchInterval: FIVE_MINUTES,
    refetchIntervalInBackground: true,
    retry: false,
    staleTime: FIVE_MINUTES,
  });
}
