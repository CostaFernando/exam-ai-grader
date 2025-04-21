const blobUrlMap = new Map<string, string>();

export async function storeFileInIndexedDB(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const request = indexedDB.open("exams_ai_grader", 1);

    request.onerror = (event) => {
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["files"], "readwrite");
      const store = transaction.objectStore("files");
      const addRequest = store.add({
        name: file.name,
        type: file.type,
        data: file,
        date: new Date().toISOString(),
      });

      addRequest.onsuccess = () => {
        const fileId = addRequest.result;
        const fileRef = createFileReference(fileId, file.name, file.type);
        resolve(fileRef);
      };

      addRequest.onerror = () => {
        reject("Error storing file in IndexedDB");
      };
    };
  });
}

export async function openFileFromReference(fileRef: string): Promise<void> {
  try {
    if (!fileRef.startsWith("idb-file://")) {
      if (fileRef.startsWith("indexeddb://")) {
        const url = await handleLegacyFileReference(fileRef);
        window.open(url, "_blank");
        return;
      } else {
        window.open(fileRef, "_blank");
        return;
      }
    }

    const url = await createBlobUrl(fileRef);

    window.open(url, "_blank");
  } catch (error) {
    console.error("Error opening file:", error);
    throw new Error("Failed to open file");
  }
}

export function getFileName(fileRef: string): string | null {
  const fileInfo = parseFileReference(fileRef);
  return fileInfo?.name || null;
}

export function cleanupBlobUrls(): void {
  blobUrlMap.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  blobUrlMap.clear();
}

function createFileReference(
  id: IDBValidKey,
  name: string,
  type: string
): string {
  const fileInfo = { id: String(id), name, type };
  const encodedInfo = btoa(encodeURIComponent(JSON.stringify(fileInfo)));
  return `idb-file://${encodedInfo}`;
}

function parseFileReference(
  fileRef: string
): { id: string; name: string; type: string } | null {
  try {
    if (!fileRef.startsWith("idb-file://")) {
      return null;
    }

    const encodedInfo = fileRef.substring("idb-file://".length);
    const decodedInfo = decodeURIComponent(atob(encodedInfo));
    const fileInfo = JSON.parse(decodedInfo);
    return fileInfo;
  } catch (error) {
    console.error("Error parsing file reference:", error);
    return null;
  }
}

async function createBlobUrl(fileRef: string): Promise<string> {
  if (blobUrlMap.has(fileRef)) {
    return blobUrlMap.get(fileRef)!;
  }

  const fileInfo = parseFileReference(fileRef);

  if (!fileInfo) {
    throw new Error("Invalid file reference");
  }

  const file = await getFileById(fileInfo.id);

  if (!file) {
    throw new Error("File not found in IndexedDB");
  }

  const url = URL.createObjectURL(file);
  blobUrlMap.set(fileRef, url);

  return url;
}

async function getFileById(id: string | number): Promise<File | null> {
  return new Promise<File | null>((resolve, reject) => {
    const request = indexedDB.open("exams_ai_grader", 1);

    request.onerror = (event) => {
      console.error(
        "Error opening database:",
        (event.target as IDBRequest).error
      );
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("files")) {
        console.error("Object store 'files' doesn't exist");
        resolve(null);
        return;
      }

      const transaction = db.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");

      let keyToUse = id;
      if (typeof id === "string" && !isNaN(Number(id))) {
        keyToUse = Number(id);
      }

      const getRequest = store.get(keyToUse);

      getRequest.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;

        if (result && result.data instanceof File) {
          resolve(result.data);
        } else if (result) {
          resolve(result.data);
        } else {
          const cursorRequest = store.openCursor();
          let fileFound = false;

          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
              .result;

            if (cursor) {
              if (
                String(cursor.key) === String(keyToUse) &&
                cursor.value &&
                cursor.value.data
              ) {
                fileFound = true;
                resolve(cursor.value.data);
              } else {
                cursor.continue();
              }
            } else if (!fileFound) {
              resolve(null);
            }
          };

          cursorRequest.onerror = () => {
            console.error("Cursor error");
            resolve(null);
          };
        }
      };

      getRequest.onerror = (event) => {
        console.error(
          "Error retrieving file:",
          (event.target as IDBRequest).error
        );
        reject("Error retrieving file from IndexedDB");
      };
    };
  });
}

async function handleLegacyFileReference(fileRef: string): Promise<string> {
  const parts = fileRef.split("/");
  const id = parts[parts.length - 1];

  if (!id || isNaN(Number(id))) {
    throw new Error("Invalid legacy file reference");
  }

  let file = await getFileById(id);
  if (!file) {
    file = await getFileById(Number(id));
  }

  if (!file) {
    throw new Error("Legacy file not found in IndexedDB");
  }

  return URL.createObjectURL(file);
}
