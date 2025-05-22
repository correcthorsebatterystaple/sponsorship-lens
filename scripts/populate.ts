import * as fs from "fs";
import csv from "csv-parser";
import format from "pg-format";
import { Pool } from "pg";

async function upsertOrganisations(organisations: Record<string, string>[]) {
  const values = organisations.map((org) => [
    org["Organisation Name"],
    org["Town/City"],
    org.County,
    org["Type & Rating"],
    org.Route,
  ]);

  const query = format(
    `
    INSERT INTO public.organisations (name, city, county, type_and_rating, route)
    VALUES %L
    ON CONFLICT (name, city, county, type_and_rating, route) DO NOTHING
  `,
    values,
  );

  const pool = new Pool({});
  const client = await pool.connect();

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
}

const results: Record<string, string>[] = [];

fs.createReadStream("organizations.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () =>
    upsertOrganisations(results).then(() =>
      console.log("Data inserted successfully"),
    ),
  );
