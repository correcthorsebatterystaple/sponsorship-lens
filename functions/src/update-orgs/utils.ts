import { defineSecret } from "firebase-functions/params";
import { Pool } from "pg";

export const DB_CONN_STRING = defineSecret("DB_CONN_STRING");

const _pool = new Pool({});
export const pool = () => {
  if (!_pool.options.connectionString) {
    _pool.options.connectionString = DB_CONN_STRING.value();
  }
  return _pool;
};

export const SPONSOR_ORGS_PAGE_URL =
  "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers";
