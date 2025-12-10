import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type useParamStateReturnType<T> = [T, Dispatch<SetStateAction<T>>];

const useParamState = <T>(
  param: string,
  initialValue: T,
): useParamStateReturnType<T> => {
  const [searchParams, setSearchParams] = useSearchParams();

  const paramValue = searchParams.get(param);
  let parsedValue: T;
  if (paramValue !== null) {
    parsedValue = JSON.parse(paramValue) as T;
  } else {
    parsedValue = initialValue;
  }

  const [value, setValue] = useState<T>(parsedValue);

  useEffect(() => {
    setSearchParams((prev) => {
      if (value !== null && value !== undefined && value !== "") {
        prev.set(param, JSON.stringify(value));
      } else prev.delete(param);
      return prev;
    });
  }, [value]);

  return [value, setValue];
};

export default useParamState;
