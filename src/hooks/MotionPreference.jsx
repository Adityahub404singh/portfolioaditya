
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useReducedMotion } from "framer-motion";

const MotionPreferenceContext = createContext({
  enabled: true,
  toggle: () => {},
});

export function MotionPreferenceProvider({ children }) {
  const prefersReduced = useReducedMotion();

  const [motionOn, setMotionOn] = useState(() => {
    try {
      return localStorage.getItem("aps-motion") !== "off";
    } catch {
      return true;
    }
  });

  const enabled = motionOn && !prefersReduced;

  const toggle = useCallback(() => {
    setMotionOn((current) => {
      const next = !current;

      try {
        localStorage.setItem(
          "aps-motion",
          next ? "on" : "off"
        );
      } catch {
        // Local storage unavailable.
      }

      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = enabled
      ? "on"
      : "off";
  }, [enabled]);

  const value = useMemo(
    () => ({
      enabled,
      toggle,
    }),
    [enabled, toggle]
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference() {
  return useContext(MotionPreferenceContext);
}
