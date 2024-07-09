// db.ts
import Dexie, { type EntityTable } from "dexie";

interface Video {
  url: string;
  title: string;
  imageUrl: string | null;
  date: string;
}

console.log("Opening database...");
const db = new Dexie("AlgomonDatabase") as Dexie & {
  videos: EntityTable<
    Video,
    "url" // primary key
  >;
};

// Schema declaration:
// ++	Auto-incremented primary key
// &	Unique index
// *	Multi-entry index
// [A+B]	Compound index or primary key
db.version(1).stores({
  videos: "url, title, imageUrl, date", // primary key "url" (for the runtime!)
});

db.open()
  .then((e) => {
    console.log("Database opened successfully");
  })
  .catch((e) => {
    console.error("Open failed: " + e.stack);
  });

export type { Video };
export { db };
