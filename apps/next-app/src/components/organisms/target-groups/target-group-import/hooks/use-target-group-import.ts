"use client";
import { useReducer } from "react";
interface State {
  jobId: string | null;
  uploading: boolean;
}
type Action =
  | { type: "job"; value: string }
  | { type: "uploading"; value: boolean }
  | { type: "reset" };
const initial: State = {
  jobId: null,
  uploading: false,
};
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "job":
      return { ...state, jobId: action.value };
    case "uploading":
      return { ...state, uploading: action.value };
    case "reset":
      return initial;
  }
}
export function useTargetGroupImport() {
  const [state, dispatch] = useReducer(reducer, initial);
  return {
    state,
    setJobId: (value: string) => dispatch({ type: "job", value }),
    setUploading: (value: boolean) => dispatch({ type: "uploading", value }),
    reset: () => dispatch({ type: "reset" }),
  };
}
export async function encodeImportFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768)
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(binary);
}
