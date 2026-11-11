
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { initialContent } from "../data";
import {
  isSupabaseConfigured,
  supabase,
} from "../lib/supabase";

/* =========================================================
   PORTFOLIO CONTEXT
========================================================= */

const PortfolioContext = createContext(null);

/* =========================================================
   STORAGE CONFIGURATION
========================================================= */

const STORAGE_KEY = "aps-portfolio-studio-v2";

const DATABASE_TABLE = "portfolio_content";

const DATABASE_ROW_ID = 1;

/* =========================================================
   DEFAULT DATA HELPERS
========================================================= */

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function safeObject(value) {
  return isPlainObject(value) ? value : {};
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

/* =========================================================
   CONTENT MERGING
========================================================= */

export function mergeContent(remote) {
  const defaults = safeObject(initialContent);
  const incoming = safeObject(remote);

  const merged = {
    ...defaults,
    ...incoming,

    profile: {
      ...safeObject(defaults.profile),
      ...safeObject(incoming.profile),
    },

    stats: {
      ...safeObject(defaults.stats),
      ...safeObject(incoming.stats),
    },

    settings: {
      ...safeObject(defaults.settings),
      ...safeObject(incoming.settings),
    },

    leetcode: {
      ...safeObject(defaults.leetcode),
      ...safeObject(incoming.leetcode),
    },
  };

  const arrayKeys = [
    "projects",
    "skills",
    "dsa",
    "certificates",
    "achievements",
    "timeline",
    "dailyUpdates",
    "goals",
    "notes",
  ];

  arrayKeys.forEach((key) => {
    if (Array.isArray(incoming[key])) {
      merged[key] = incoming[key];
    } else {
      merged[key] = safeArray(defaults[key]);
    }
  });

  return merged;
}

/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function readLocalContent() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    if (!isPlainObject(parsed)) {
      return null;
    }

    return mergeContent(parsed);
  } catch (error) {
    console.error(
      "Portfolio local storage read error:",
      error
    );

    return null;
  }
}

function writeLocalContent(content) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(content)
    );

    return true;
  } catch (error) {
    console.error(
      "Portfolio local storage write error:",
      error
    );

    throw new Error(
      "Could not save portfolio data in local storage."
    );
  }
}

/* =========================================================
   SUPABASE ERROR HELPER
========================================================= */

function getErrorMessage(error) {
  if (!error) {
    return "An unknown error occurred.";
  }

  return (
    error.message ||
    error.details ||
    error.hint ||
    "Something went wrong with Supabase."
  );
}

/* =========================================================
   PORTFOLIO PROVIDER
========================================================= */

export function PortfolioProvider({ children }) {
  /* -------------------------------------------------------
     MAIN PORTFOLIO STATE
  ------------------------------------------------------- */

  const [content, setContent] = useState(() =>
    mergeContent(initialContent)
  );

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [session, setSession] = useState(null);

  const [error, setError] = useState(null);

  const [lastSynced, setLastSynced] = useState(null);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  /* -------------------------------------------------------
     INTERNAL REFS
  ------------------------------------------------------- */

  const mountedRef = useRef(false);

  const saveQueueRef = useRef(Promise.resolve());

  const contentRef = useRef(content);

  /* -------------------------------------------------------
     UPDATE CONTENT REF
  ------------------------------------------------------- */

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  /* =======================================================
     NETWORK STATUS
  ======================================================= */

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  /* =======================================================
     LOAD PORTFOLIO CONTENT
  ======================================================= */

  useEffect(() => {
    let active = true;

    mountedRef.current = true;

    async function loadPortfolio() {
      setLoading(true);
      setError(null);

      /* ---------------------------------------------------
         LOCAL MODE
      --------------------------------------------------- */

      if (!isSupabaseConfigured || !supabase) {
        const localContent = readLocalContent();

        if (active) {
          setContent(
            localContent || mergeContent(initialContent)
          );

          setSession(null);
          setLoading(false);
        }

        return;
      }

      /* ---------------------------------------------------
         CLOUD MODE
      --------------------------------------------------- */

      try {
        const [
          portfolioResult,
          authResult,
        ] = await Promise.all([
          supabase
            .from(DATABASE_TABLE)
            .select("content")
            .eq("id", DATABASE_ROW_ID)
            .maybeSingle(),

          supabase.auth.getSession(),
        ]);

        if (!active) {
          return;
        }

        /* -----------------------------------------------
           DATABASE ERROR
        ----------------------------------------------- */

        if (portfolioResult.error) {
          throw portfolioResult.error;
        }

        /* -----------------------------------------------
           AUTHENTICATION ERROR
        ----------------------------------------------- */

        if (authResult.error) {
          console.warn(
            "Could not retrieve auth session:",
            authResult.error
          );
        }

        /* -----------------------------------------------
           LOAD CLOUD CONTENT
        ----------------------------------------------- */

        const remoteContent =
          portfolioResult.data?.content;

        if (remoteContent) {
          const normalized = mergeContent(
            remoteContent
          );

          setContent(normalized);
          contentRef.current = normalized;

          /* Save a local backup of successful cloud data. */

          try {
            writeLocalContent(normalized);
          } catch (backupError) {
            console.warn(
              "Local backup could not be updated:",
              backupError
            );
          }

          setLastSynced(new Date().toISOString());
        } else {
          /*
           * No database row exists yet.
           * Keep initial portfolio data available.
           */

          const localContent = readLocalContent();

          const startingContent =
            localContent || mergeContent(initialContent);

          setContent(startingContent);
          contentRef.current = startingContent;
        }

        /* -----------------------------------------------
           AUTH SESSION
        ----------------------------------------------- */

        setSession(
          authResult.data?.session || null
        );

      } catch (loadError) {
        console.error(
          "Portfolio cloud loading failed:",
          loadError
        );

        if (active) {
          setError(
            getErrorMessage(loadError)
          );

          /*
           * Keep the existing/default content visible.
           * Do not silently switch cloud mode to local mode.
           */

          setContent((previous) =>
            mergeContent(previous)
          );
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPortfolio();

    /* =====================================================
       AUTH STATE LISTENER
    ===================================================== */

    let authSubscription = null;

    if (isSupabaseConfigured && supabase) {
      const {
        data,
      } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!active) {
            return;
          }

          setSession(nextSession || null);
        }
      );

      authSubscription =
        data?.subscription || null;
    }

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      active = false;

      mountedRef.current = false;

      authSubscription?.unsubscribe();
    };
  }, []);

  /* =======================================================
     SAVE PORTFOLIO CONTENT
  ======================================================= */

  const saveContent = useCallback(
    async (nextContent) => {
      const safeContent = mergeContent(
        nextContent
      );

      /*
       * Update the UI immediately.
       */

      setContent(safeContent);

      contentRef.current = safeContent;

      setError(null);

      /* ---------------------------------------------------
         LOCAL STORAGE MODE
      --------------------------------------------------- */

      if (!isSupabaseConfigured || !supabase) {
        writeLocalContent(safeContent);

        return safeContent;
      }

      /* ---------------------------------------------------
         CHECK NETWORK
      --------------------------------------------------- */

      if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        throw new Error(
          "Internet connection is unavailable. Your changes are visible locally but have not been published to Supabase."
        );
      }

      /* ---------------------------------------------------
         QUEUE CLOUD SAVES
      --------------------------------------------------- */

      setSaving(true);

      const performSave = async () => {
        const { error: saveError } = await supabase
          .from(DATABASE_TABLE)
          .upsert(
            {
              id: DATABASE_ROW_ID,
              content: safeContent,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

        if (saveError) {
          throw saveError;
        }

        /* -----------------------------------------------
           SAVE LOCAL BACKUP AFTER CLOUD SUCCESS
        ----------------------------------------------- */

        try {
          writeLocalContent(safeContent);
        } catch (backupError) {
          console.warn(
            "Cloud save succeeded, but local backup failed:",
            backupError
          );
        }

        if (mountedRef.current) {
          setLastSynced(
            new Date().toISOString()
          );

          setError(null);
        }

        return safeContent;
      };

      /*
       * Serialize saves so rapid clicks do not cause
       * older requests to overwrite newer content.
       */

      const queuedSave = saveQueueRef.current
        .catch(() => undefined)
        .then(performSave);

      saveQueueRef.current = queuedSave;

      try {
        return await queuedSave;

      } catch (saveError) {
        console.error(
          "Portfolio publishing failed:",
          saveError
        );

        if (mountedRef.current) {
          setError(
            getErrorMessage(saveError)
          );
        }

        throw new Error(
          getErrorMessage(saveError)
        );

      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    []
  );

  /* =======================================================
     REFRESH PORTFOLIO CONTENT
  ======================================================= */

  const refreshContent = useCallback(
    async () => {
      if (!isSupabaseConfigured || !supabase) {
        const localContent = readLocalContent();

        if (localContent) {
          setContent(localContent);
          contentRef.current = localContent;
        }

        return localContent;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } =
          await supabase
            .from(DATABASE_TABLE)
            .select("content")
            .eq("id", DATABASE_ROW_ID)
            .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        const refreshedContent = mergeContent(
          data?.content || initialContent
        );

        setContent(refreshedContent);

        contentRef.current = refreshedContent;

        try {
          writeLocalContent(refreshedContent);
        } catch (backupError) {
          console.warn(
            "Backup update failed:",
            backupError
          );
        }

        setLastSynced(
          new Date().toISOString()
        );

        return refreshedContent;

      } catch (refreshError) {
        setError(
          getErrorMessage(refreshError)
        );

        throw refreshError;

      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =======================================================
     AUTHENTICATION HELPERS
  ======================================================= */

  const signOut = useCallback(
    async () => {
      if (!supabase || !isSupabaseConfigured) {
        setSession(null);
        return;
      }

      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setSession(null);
    },
    []
  );

  const getCurrentUser = useCallback(
    () => {
      return session?.user || null;
    },
    [session]
  );

  /* =======================================================
     RESET LOCAL PORTFOLIO DATA
  ======================================================= */

  const resetLocalContent = useCallback(
    () => {
      const defaults = mergeContent(
        initialContent
      );

      setContent(defaults);

      contentRef.current = defaults;

      if (!isSupabaseConfigured) {
        writeLocalContent(defaults);
      }

      return defaults;
    },
    []
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      /* Portfolio data */

      content,

      setContent,

      saveContent,

      refreshContent,

      resetLocalContent,

      /* Loading and saving */

      loading,

      saving,

      /* Authentication */

      session,

      user: session?.user || null,

      getCurrentUser,

      signOut,

      /* Supabase status */

      isCloud: Boolean(
        isSupabaseConfigured && supabase
      ),

      isSupabaseConfigured,

      /* Network status */

      isOnline,

      /* Error handling */

      error,

      clearError: () => setError(null),

      /* Sync information */

      lastSynced,

    }),
    [
      content,
      saveContent,
      refreshContent,
      resetLocalContent,
      loading,
      saving,
      session,
      getCurrentUser,
      signOut,
      isOnline,
      error,
      lastSynced,
    ]
  );

  /* =======================================================
     PROVIDER RENDER
  ======================================================= */

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

/* =========================================================
   CUSTOM HOOK
========================================================= */

export function usePortfolio() {
  const context = useContext(
    PortfolioContext
  );

  if (!context) {
    throw new Error(
      "usePortfolio must be used inside PortfolioProvider. Wrap your application with PortfolioProvider."
    );
  }

  return context;
}

/* =========================================================
   OPTIONAL HELPER HOOKS
========================================================= */

export function usePortfolioContent() {
  const {
    content,
    saveContent,
    loading,
  } = usePortfolio();

  return {
    content,
    saveContent,
    loading,
  };
}

export function usePortfolioAuth() {
  const {
    session,
    user,
    signOut,
  } = usePortfolio();

  return {
    session,
    user,
    isAuthenticated: Boolean(session),
    signOut,
  };
}

export function usePortfolioSync() {
  const {
    isCloud,
    isOnline,
    saving,
    loading,
    error,
    lastSynced,
    refreshContent,
  } = usePortfolio();

  return {
    isCloud,
    isOnline,
    saving,
    loading,
    error,
    lastSynced,
    refreshContent,
  };
}
