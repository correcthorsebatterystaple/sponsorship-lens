import { onRequest } from "firebase-functions/v2/https";
import { DB_CONN_STRING } from "./update-orgs/utils";
import { main } from "./update-orgs";
import { defineSecret } from "firebase-functions/params";

const SECRET_HEADER = defineSecret("SECRET_HEADER");

export const updateOrgs = onRequest(
  { secrets: [DB_CONN_STRING, SECRET_HEADER], memory: "512MiB" },
  async (request, response) => {
    if (request.headers["x-secret-header"] !== SECRET_HEADER.value()) {
      response.status(403).send("Forbidden");
      return;
    }

    await main();

    response.send("OK");
  },
);
