import type { QuoteFormData, UIFlowState } from "@/types";

export const FORM_KEY = "sp_quote_wip";
export const UI_KEY = "sp_quote_ui";

export type CookieStore = {
  get?(
    name: string
  ): { value: string } | undefined;
  set?(
    name: string,
    value: string,
    options?: {
      path?: string;
      maxAge?: number;
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
    }
  ): void;
  delete?(name: string): void;
};

const DAY_IN_SECONDS = 60 * 60 * 24;

export const readJsonFrom = <T>(store: CookieStore, key: string): T | undefined => {
  if (typeof store?.get !== "function") return undefined;
  const entry = store.get.call(store, key);
  if (!entry?.value) return undefined;

  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return undefined;
  }
};

export const writeJsonTo = <T>(
  store: CookieStore,
  key: string,
  value: T,
  maxAgeDays = 7
) => {
  if (typeof store?.set !== "function") return;

  store.set.call(store, key, JSON.stringify(value), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: maxAgeDays * DAY_IN_SECONDS,
  });
};

export const clearFrom = (store: CookieStore, key: string) => {
  if (typeof store?.delete !== "function") return;
  store.delete.call(store, key);
};

export const getInitialForm = (): QuoteFormData => ({
  client: {
    clientType: "Company",
    companyName: "",
    contactPerson: "",
    firstName: "",
    lastName: "",
    email: "",
    emails: "[]",
    phone: "",
    countryCode: "+971",
    role: "",
    trn: "",
    hasNoTrn: false,
    address: "",
    city: "",
    area: "",
    state: "",
    postalCode: "",
    country: "",
    additionalInfo: "",
  },
  products: [],
  operational: {
    papers: [],
    finishing: [],
    plates: null,
    units: null,
    impressions: null,
  },
  calculation: {
    basePrice: 0,
    marginAmount: 0,
    marginPercentage: 15,
    subtotal: 0,
    discount: {
      isApplied: false,
      percentage: 0,
      amount: 0,
    },
    finalSubtotal: 0,
    vatAmount: 0,
    totalPrice: 0,
  },
  approval: undefined,
  salesPersonId: undefined,
});

export const getInitialUI = (): UIFlowState => ({
  mode: "new",
  selectedExistingQuoteId: undefined,
});
