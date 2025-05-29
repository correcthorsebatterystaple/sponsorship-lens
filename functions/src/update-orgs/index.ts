import { fetchCsvData, getCsvUrl } from "./csv";
import { insertIngestLog, upsertOrganisations } from "./repository";
import { CsvParser } from "csv-parser";

export async function main() {
  console.log("Updating organisations...");

  const csvUrl = await getCsvUrl();

  if (!csvUrl) {
    throw new Error("CSV URL not found");
  }

  const csvStream = await fetchCsvData(csvUrl);

  await batchUpsertOrganisations(csvStream);
  await insertIngestLog(csvUrl);

  console.log("Organisations updated successfully.");
}

async function batchUpsertOrganisations(data: CsvParser) {
  const rows: string[][] = [];

  await new Promise<void>((resolve, reject) =>
    data
      .on("data", (row) => rows.push(Object.values(row)))
      .on("end", resolve)
      .on("error", reject),
  );

  return upsertOrganisations(rows);
}
