export const BackupRecord = {
  id: null,
  content_type: "",
  url: "",
  file_size: null,
  processed: false,
  inserted_at: "",
};

const processBackupRecord = (backup) => {
  return {
    ...backup,
    id: backup.id || null,
    content_type: backup.content_type || "",
    url: backup.url || "",
    file_size: backup.file_size || null,
    processed: backup.processed || false,
    inserted_at: backup.inserted_at || new Date().toISOString(),
  };
};

export function createBackupsSlice(setScoped, getScoped, rootSet, rootGet) {
  return {
    fetchOrCreateBackupsSuccess(backups) {
      setScoped((state) => {
        // 1. Create a shallow copy of the current 'backups' state.
        // This acts as our 'mutable' draft within the function scope.
        const mutableDraft = { ...state };
        backups.forEach((backup) => {
          const newRecord = processBackupRecord(backup);
          // Mutate the local draft safely
          mutableDraft[backup.inserted_at] = newRecord;
        });

        // 3. Return the *final* mutated object as the new state value.
        return {
          ...mutableDraft,
        };
      });
    },

    async fetchBackups() {
      // mark loading
      setScoped((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch("/api/v1/kollective/backups");

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const backups = await response.json();

        // Delegate to the existing success handler to keep behaviour consistent
        if (typeof this?.fetchOrCreateBackupsSuccess === "function") {
          this.fetchOrCreateBackupsSuccess(backups);
        } else {
          // Fallback if `this` isn't bound: call the local action via scoped update
          setScoped((state) => {
            const mutableDraft = { ...state };
            (backups || []).forEach((backup) => {
              const newRecord = processBackupRecord(backup);
              mutableDraft[backup.inserted_at] = newRecord;
            });
            return { ...mutableDraft };
          });
        }

        // clear loading flag
        setScoped((state) => {
          state.isLoading = false;
        });

        return backups;
      } catch (error) {
        // Log and set error state but keep existing items intact
        console.error("Failed to fetch backups", error);
        setScoped((state) => {
          state.isLoading = false;
          state.error = error && error.message ? error.message : "Failed to fetch backups";
        });
        return null;
      }
    },

    async createBackup() {
      // mark loading
      setScoped((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const response = await fetch("/api/v1/kollective/backups", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }

        const backup = await response.json();

        // Delegate to existing success handler to keep behaviour consistent
        if (typeof this?.fetchOrCreateBackupsSuccess === "function") {
          this.fetchOrCreateBackupsSuccess([backup]);
        } else {
          // Fallback if `this` isn't bound: update via scoped setter
          setScoped((state) => {
            const mutableDraft = { ...state };
            const newRecord = processBackupRecord(backup);
            mutableDraft[backup.inserted_at] = newRecord;
            return { ...mutableDraft };
          });
        }

        // clear loading
        setScoped((state) => {
          state.isLoading = false;
        });

        return backup;
      } catch (error) {
        console.error("Failed to create backup", error);
        setScoped((state) => {
          state.isLoading = false;
          state.error = error && error.message ? error.message : "Failed to create backup";
        });
        return null;
      }
    },


  };
}

export default createBackupsSlice;


