export async function storeFileInIndexedDB(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Open a connection to IndexedDB
    const request = indexedDB.open("exams_ai_grader", 1);

    request.onerror = (event) => {
      reject("IndexedDB error: " + (event.target as IDBRequest).error);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create an object store for files if it doesn't exist
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
        // Generate a URL for the stored file
        const fileId = addRequest.result;
        const url = `indexeddb://files/${fileId}`;
        resolve(url);
      };

      addRequest.onerror = () => {
        reject("Error storing file in IndexedDB");
      };
    };
  });
}

export async function getFileFromIndexedDB(
  fileId: string
): Promise<File | null> {
  return new Promise<File | null>((resolve, reject) => {
    const request = indexedDB.open("exams_ai_grader", 1);

    request.onerror = () => {
      reject("IndexedDB error");
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(["files"], "readonly");
      const store = transaction.objectStore("files");

      // Extract the ID from the URL format "indexeddb://files/{id}"
      const id = parseInt(fileId.split("/").pop() || "0");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          resolve(getRequest.result.data);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        reject("Error retrieving file from IndexedDB");
      };
    };
  });
}
