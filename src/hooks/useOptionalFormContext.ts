// hooks/useOptionalFormContext.ts
import { useFormContext } from "react-hook-form";

export function useOptionalFormContext() {
  try {
    return useFormContext();
  } catch {
    return undefined;
  }
}
