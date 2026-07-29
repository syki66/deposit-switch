const SHARE_PREFIX = "#share=v1.";
const SHARE_FIELDS = [
  "amount",
  "switchDate",
  "oldStartDate",
  "oldMaturityDate",
  "oldInterest",
  "earlyTerminationInterest",
  "oldTax",
  "newInterest",
  "newTax",
  "switchingCost",
];

const toBase64Url = (value) =>
  window
    .btoa(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return window.atob(`${normalized}${padding}`);
};

const createShareHash = (inputs) => {
  const values = SHARE_FIELDS.map((field) => String(inputs[field] ?? ""));
  return `${SHARE_PREFIX}${toBase64Url(JSON.stringify(values))}`;
};

const readInputsFromShareHash = (hash) => {
  if (!hash || !hash.startsWith(SHARE_PREFIX) || hash.length > 4096) {
    return null;
  }

  try {
    const values = JSON.parse(fromBase64Url(hash.slice(SHARE_PREFIX.length)));

    if (
      !Array.isArray(values) ||
      values.length !== SHARE_FIELDS.length ||
      values.some((value) => typeof value !== "string")
    ) {
      return null;
    }

    return SHARE_FIELDS.reduce(
      (inputs, field, index) => ({ ...inputs, [field]: values[index] }),
      {}
    );
  } catch {
    return null;
  }
};

const createShareUrl = (inputs, origin = window.location.origin) =>
  `${origin}/${createShareHash(inputs)}`;

export { createShareHash, createShareUrl, readInputsFromShareHash };
