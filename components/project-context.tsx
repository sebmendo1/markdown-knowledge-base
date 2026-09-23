"use client";

import { createContext, useContext } from "react";

export const ProjectContext = createContext("");

export function useProject() {
  return useContext(ProjectContext);
}
