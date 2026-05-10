import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import { env } from "@/lib/env";

const configuration = new Configuration({
  basePath: PlaidEnvironments[env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": env.PLAID_CLIENT_ID,
      "PLAID-SECRET": env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export const plaidProducts = env.PLAID_PRODUCTS.split(",").map(
  (product) => product.trim() as Products,
);

export const plaidCountryCodes = env.PLAID_COUNTRY_CODES.split(",").map(
  (country) => country.trim() as CountryCode,
);
