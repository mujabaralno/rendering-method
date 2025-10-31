import { cookies } from "next/headers";
import type { QuoteFormData, UIFlowState } from "@/types";

const FORM_COOKIE_KEY = "sp_quote_wip";
const UI_COOKIE_KEY = "sp_quote_ui";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const INITIAL_FORM: QuoteFormData = {
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
};

const INITIAL_UI: UIFlowState = {
  mode: "new",
  selectedExistingQuoteId: undefined,
};

const encode = (value: unknown) => JSON.stringify(value);

const decode = <T,>(raw: string): T => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded) as T;
    } catch {
      throw new Error("Failed to decode cookie value");
    }
  }
};

const deepClone = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

const normalizeForm = (value?: Partial<QuoteFormData>): QuoteFormData => {
  const base = deepClone(INITIAL_FORM);
  if (!value) return base;

  return {
    ...base,
    ...value,
    client: {
      ...base.client,
      ...value.client,
    },
    products: value.products
      ? value.products.map((p) => deepClone(p))
      : base.products,
    operational: {
      ...base.operational,
      ...value.operational,
      papers: value.operational?.papers
        ? value.operational.papers.map((paper) => deepClone(paper))
        : base.operational.papers,
      finishing: value.operational?.finishing
        ? value.operational.finishing.map((finishing) => deepClone(finishing))
        : base.operational.finishing,
    },
    calculation: {
      ...base.calculation,
      ...value.calculation,
      discount: {
        ...base.calculation.discount!,
        ...value.calculation?.discount,
      },
    },
    approval: value.approval ? deepClone(value.approval) : base.approval,
    salesPersonId:
      value.salesPersonId ?? base.salesPersonId,
  };
};

const readCookie = async <T,>(
  key: string,
  normalizer: (value?: Partial<T>) => T
): Promise<T> => {
  const store = await cookies();
  const raw = store.get(key)?.value;

  if (!raw) return normalizer(undefined);

  try {
    const parsed = decode<Partial<T>>(raw);
    return normalizer(parsed);
  } catch {
    return normalizer(undefined);
  }
};

const writeCookie = async (key: string, value: unknown) => {
  const store = await cookies();
  store.set(key, encode(value), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
};

export const getInitialForm = () => deepClone(INITIAL_FORM);
export const getInitialUI = () => deepClone(INITIAL_UI);

export const getQuoteForm = (): Promise<QuoteFormData> =>
  readCookie<QuoteFormData>(FORM_COOKIE_KEY, normalizeForm);

export const setQuoteForm = (value: QuoteFormData) =>
  writeCookie(FORM_COOKIE_KEY, value);

export const getUIState = (): Promise<UIFlowState> =>
  readCookie<UIFlowState>(UI_COOKIE_KEY, (value) => {
    const base = deepClone(INITIAL_UI);
    if (!value) return base;
    const merged: UIFlowState = {
      ...base,
      ...value,
    };
    if (merged.mode === "new") {
      merged.selectedExistingQuoteId = undefined;
    }
    return merged;
  });

export const setUIState = async (value: UIFlowState) => {
  if (value.mode === "new") {
    await writeCookie(UI_COOKIE_KEY, {
      ...value,
      selectedExistingQuoteId: undefined,
    });
    return;
  }
  await writeCookie(UI_COOKIE_KEY, value);
};

export const resetQuoteState = async () => {
  await Promise.all([setQuoteForm(getInitialForm()), setUIState(getInitialUI())]);
};

export const getQuoteState = async () => ({
  form: await getQuoteForm(),
  ui: await getUIState(),
});
