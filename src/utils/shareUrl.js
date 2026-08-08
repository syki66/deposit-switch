const SHARE_PREFIX = "#share=v2.";
const LEGACY_SHARE_PREFIX = "#share=v1.";
const SHARE_FIELDS = [
  "amount",
  "interestType",
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
  const isCurrent = hash?.startsWith(SHARE_PREFIX);
  const isLegacy = hash?.startsWith(LEGACY_SHARE_PREFIX);

  if (!hash || (!isCurrent && !isLegacy) || hash.length > 4096) {
    return null;
  }

  try {
    const prefix = isCurrent ? SHARE_PREFIX : LEGACY_SHARE_PREFIX;
    const fields = isCurrent
      ? SHARE_FIELDS
      : SHARE_FIELDS.filter((field) => field !== "interestType");
    const values = JSON.parse(fromBase64Url(hash.slice(prefix.length)));

    if (
      !Array.isArray(values) ||
      values.length !== fields.length ||
      values.some((value) => typeof value !== "string")
    ) {
      return null;
    }

    const inputs = fields.reduce(
      (inputs, field, index) => ({ ...inputs, [field]: values[index] }),
      {}
    );
    return { ...inputs, interestType: inputs.interestType || "simple" };
  } catch {
    return null;
  }
};

const createShareUrl = (inputs, origin = window.location.origin) =>
  `${origin}/${createShareHash(inputs)}`;

export { createShareHash, createShareUrl, readInputsFromShareHash };
