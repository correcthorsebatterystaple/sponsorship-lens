import { onRequest } from "firebase-functions/v2/https";
import { DB_CONN_STRING } from "./update-orgs/utils";
import { main } from "./update-orgs";

export const updateOrgs = onRequest(
  { secrets: [DB_CONN_STRING], memory: "512MiB" },
  async (_, response) => {
    await main();
    response.send("OK");
  },
);
