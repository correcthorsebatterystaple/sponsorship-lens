import format from "pg-format";
import { pool } from "./utils";

export async function upsertOrganisations(organisations: string[][]) {
  console.log("Upserting organisations...");

  const values = organisations;
  const query = format(
    `
    INSERT INTO public.organisations (name, city, county, type_and_rating, route)
    VALUES %L
    ON CONFLICT (name, city, county, type_and_rating, route) DO NOTHING
  `,
    values,
  );

  const client = await pool().connect();

  await client.query("BEGIN");
  try {
    await client.query(query);
    await client.query("COMMIT");
  } catch (e) {
    client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  console.log(`Upserted ${values.length} organisations successfully.`);
}

export async function insertIngestLog(url: string) {
  console.log("Adding ingest log...");

  const client = await pool().connect();

  await client.query("BEGIN");
  try {
    await client.query("INSERT INTO public.ingest (url) VALUES ($1)", [url]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  console.log("Ingest log added successfully.");
}
