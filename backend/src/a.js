// fixUsernameIndex.js
import { MongoClient } from "mongodb";
import "dotenv/config";

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();               // DB from URI
  const users = db.collection("users");

  try {
    console.log("Dropping old username_1 index if exists…");
    await users.dropIndex("username_1").catch(() => {});
    console.log("Creating partial unique index…");
    // unique ONLY when username is a non-empty string
    await users.createIndex(
      { username: 1 },
      { unique: true, partialFilterExpression: { username: { $type: "string", $gt: "" } } }
    );
    console.log("✅ Done. username unique only when non-empty string.");
  } catch (e) {
    console.error("❌ Index create failed:", e.message);
  } finally {
    await client.close();
  }
})();
