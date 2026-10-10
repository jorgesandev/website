import { openDB } from "idb";
import { isMatch, type Match } from "./match";
const db = () =>
  openDB("pingpong", 1, {
    upgrade(database) {
      database.createObjectStore("matches", { keyPath: "id" });
    },
  });
export async function saveMatch(match: Match) {
  const database = await db();
  await database.put("matches", match);
  database.close();
}
export async function loadMatches(): Promise<Match[]> {
  const database = await db();
  const matches: unknown[] = await database.getAll("matches");
  database.close();
  return matches.filter(isMatch).sort((a, b) => b.created - a.created);
}
