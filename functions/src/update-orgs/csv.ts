import cheerio from "cheerio";
import csv from "csv-parser";
import { SPONSOR_ORGS_PAGE_URL } from "./utils";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";

export async function getCsvUrl() {
  console.log("Fetching sponsor organisations page...");

  const pageHtml = await fetch(SPONSOR_ORGS_PAGE_URL);

  console.log("Scraping page for CSV URL...");

  const pageBody = await pageHtml.text();
  const $ = cheerio.load(pageBody);
  const selector =
    "#documents > section > div.gem-c-attachment__details > h3 > a";

  return $(selector).attr("href");
}

export async function fetchCsvData(csvUrl: string) {
  console.log("Downloading CSV file...");

  const response = await fetch(csvUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`);
  }

  if (response.body === null) {
    throw new Error("Response body is null");
  }

  return Readable.fromWeb(response.body as ReadableStream<Uint8Array>).pipe(
    csv(),
  );
}
