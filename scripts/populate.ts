import csv from "csv-parser";
import format from "pg-format";
import { Pool } from "pg";
import axios from "axios";
import * as cheerio from "cheerio";
import { Readable } from "stream";

async function upsertOrganisations(organisations: Record<string, string>[]) {
  console.log("Upserting organisations...");

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

  const pool = new Pool({ connectionString: process.env.DB_CONN_STRING });
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
    pool.end();
  }

  console.log(`Upserted ${values.length} organisations successfully.`);
}

async function insertIngestLog(url: string) {
  console.log("Adding ingest log...");

  const pool = new Pool({ connectionString: process.env.DB_CONN_STRING });
  const client = await pool.connect();

  await client.query("BEGIN");
  try {
    await client.query("INSERT INTO public.ingest (url) VALUES ($1)", [url]);
    await client.query("COMMIT");
  } catch (e) {
    client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    pool.end();
  }

  console.log("Ingest log added successfully.");
}

async function main() {
  console.log("Downloading latest CSV...");

  const pageUrl =
    "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers";
  const selector =
    "#documents > section > div.gem-c-attachment__details > h3 > a";

  const pageHtml = await axios.get(pageUrl);

  console.log("Parsing page for CSV URL...");

  const $ = cheerio.load(pageHtml.data);
  const csvUrl = $(selector).attr("href");

  if (!csvUrl) {
    throw new Error("CSV URL not found on the page");
  }

  console.log("CSV URL found");

  console.log("Downloading CSV file...");
  const fileStream = await axios.get<Readable>(csvUrl, {
    responseType: "stream",
  });

  const results: Record<string, string>[] = [];
  fileStream.data
    .pipe(csv())
    .on("data", (data: Record<string, string>) => results.push(data))
    .on("end", () =>
      upsertOrganisations(results).then(() => insertIngestLog(csvUrl)),
    );
}

main();
