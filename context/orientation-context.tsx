"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

type Orientation = "horizontal" | "vertical" | null;

interface OrientationContextType {
  orientation: Orientation;
  isHorizontal: boolean;
  isDesktop: boolean;
}

const OrientationContext = createContext<OrientationContextType | undefined>(
  undefined
);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function OrientationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orientation, setOrientation] = useState<Orientation>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useIsomorphicLayoutEffect(() => {
    setOrientation(window.innerWidth >= 768 ? "horizontal" : "vertical");
  }, []);

  useEffect(() => {
    if (orientation !== null) {
      setOrientation(isDesktop ? "horizontal" : "vertical");
    }
  }, [isDesktop, orientation]);

  const value = {
    orientation,
    isHorizontal: orientation === "horizontal",
    isDesktop,
  };

  if (orientation === null) {
    return null;
  }

  return (
    <OrientationContext.Provider value={value}>
      {children}
    </OrientationContext.Provider>
  );
}

export function useOrientation() {
  const context = useContext(OrientationContext);
  if (context === undefined) {
    throw new Error(
      "useOrientation must be used within an OrientationProvider"
    );
  }
  return context;
}
