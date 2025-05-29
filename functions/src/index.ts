import { onRequest } from "firebase-functions/v2/https";
import csv from "csv-parser";
import format from "pg-format";
import { Pool } from "pg";
import axios from "axios";
import cheerio from "cheerio";
import { Readable } from "stream";
import { defineSecret } from "firebase-functions/params";

const DB_CONN_STRING = defineSecret("DB_CONN_STRING");

let pool: Pool;

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

  console.log(`Upserted ${values.length} organisations successfully.`);
}

async function insertIngestLog(url: string) {
  console.log("Adding ingest log...");

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
  }

  console.log("Ingest log added successfully.");
}

export const updateOrgs = onRequest(async (request, response) => {
  console.log("Downloading latest CSV...");

  if (!pool) {
    pool = new Pool({
      connectionString: DB_CONN_STRING.value(),
    });
  }

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

  await new Promise((resolve, reject) => {
    fileStream.data
      .pipe(csv())
      .on("data", (data: Record<string, string>) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  await upsertOrganisations(results);
  await insertIngestLog(csvUrl);
  await pool.end();

  response.status(200).send("OK");
});
