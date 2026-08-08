const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

const getDaysBetween = (start, end) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate) {
    return NaN;
  }

  return (endDate.getTime() - startDate.getTime()) / DAY_IN_MS;
};

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return NaN;
  }

  return Number(String(value).replace(/,/g, ""));
};

const getInterestType = (value) =>
  value === "compound" ? "compound" : "simple";

const validateInputs = (inputs) => {
  const errors = {};
  const amount = toNumber(inputs.amount);
  const switchingCost = toNumber(inputs.switchingCost);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "예치 원금을 0원보다 크게 입력해주세요.";
  }

  const rateFields = [
    ["oldInterest", "기존 예금 금리"],
    ["earlyTerminationInterest", "중도해지 적용 금리"],
    ["newInterest", "새 예금 금리"],
  ];

  rateFields.forEach(([field, label]) => {
    const value = toNumber(inputs[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors[field] = `${label}는 0%에서 100% 사이로 입력해주세요.`;
    }
  });

  const taxFields = [
    ["oldTax", "기존 예금 세율"],
    ["newTax", "새 예금 세율"],
  ];

  taxFields.forEach(([field, label]) => {
    const value = toNumber(inputs[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      errors[field] = `${label}은 0%에서 100% 사이로 입력해주세요.`;
    }
  });

  if (!Number.isFinite(switchingCost) || switchingCost < 0) {
    errors.switchingCost = "추가 비용은 0원 이상으로 입력해주세요.";
  }

  const startDate = parseDate(inputs.oldStartDate);
  const switchDate = parseDate(inputs.switchDate);
  const maturityDate = parseDate(inputs.oldMaturityDate);

  if (!startDate) {
    errors.oldStartDate = "기존 예금 가입일을 입력해주세요.";
  }
  if (!switchDate) {
    errors.switchDate = "갈아타는 날짜를 입력해주세요.";
  }
  if (!maturityDate) {
    errors.oldMaturityDate = "기존 예금 만기일을 입력해주세요.";
  }

  if (startDate && maturityDate && startDate >= maturityDate) {
    errors.oldMaturityDate = "만기일은 가입일 이후여야 합니다.";
  }
  if (startDate && switchDate && switchDate <= startDate) {
    errors.switchDate = "갈아타는 날짜는 가입일 이후여야 합니다.";
  }
  if (switchDate && maturityDate && switchDate >= maturityDate) {
    errors.switchDate = "갈아타는 날짜는 만기일 이전이어야 합니다.";
  }

  return errors;
};

const calculateInterest = ({
  principal,
  annualRate,
  taxRate,
  days,
  interestType = "simple",
}) => {
  const rate = annualRate / 100;
  const grossInterest =
    interestType === "compound"
      ? principal * (Math.pow(1 + rate / 12, (days / 365) * 12) - 1)
      : principal * rate * (days / 365);
  const tax = grossInterest * (taxRate / 100);

  return {
    grossInterest,
    tax,
    netInterest: grossInterest - tax,
  };
};

const calculateDepositComparison = (inputs) => {
  const errors = validateInputs(inputs);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const principal = toNumber(inputs.amount);
  const interestType = getInterestType(inputs.interestType);
  const fullDays = getDaysBetween(
    inputs.oldStartDate,
    inputs.oldMaturityDate
  );
  const elapsedDays = getDaysBetween(inputs.oldStartDate, inputs.switchDate);
  const remainingDays = getDaysBetween(
    inputs.switchDate,
    inputs.oldMaturityDate
  );

  const keep = calculateInterest({
    principal,
    annualRate: toNumber(inputs.oldInterest),
    taxRate: toNumber(inputs.oldTax),
    days: fullDays,
    interestType,
  });
  const earlyTermination = calculateInterest({
    principal,
    annualRate: toNumber(inputs.earlyTerminationInterest),
    taxRate: toNumber(inputs.oldTax),
    days: elapsedDays,
    interestType,
  });
  const newDeposit = calculateInterest({
    principal,
    annualRate: toNumber(inputs.newInterest),
    taxRate: toNumber(inputs.newTax),
    days: remainingDays,
    interestType,
  });
  const switchingCost = toNumber(inputs.switchingCost);
  const switchNetInterest =
    earlyTermination.netInterest + newDeposit.netInterest - switchingCost;
  const difference = switchNetInterest - keep.netInterest;

  let recommendation = "equal";
  if (difference > 0) recommendation = "switch";
  if (difference < 0) recommendation = "keep";

  return {
    errors: {},
    assumptions: {
      dayCountBasis: 365,
      compoundingPeriodsPerYear: interestType === "compound" ? 12 : null,
      interestType,
      fullDays,
      elapsedDays,
      remainingDays,
    },
    keep,
    switch: {
      earlyTermination,
      newDeposit,
      switchingCost,
      netInterest: switchNetInterest,
    },
    difference,
    recommendation,
  };
};

export {
  calculateDepositComparison,
  calculateInterest,
  getDaysBetween,
  validateInputs,
};
