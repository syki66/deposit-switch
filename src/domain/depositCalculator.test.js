import {
  calculateDepositComparison,
  getDaysBetween,
  validateInputs,
} from "./depositCalculator";

const validInputs = {
  amount: "10000000",
  oldStartDate: "2024-01-01",
  switchDate: "2024-07-01",
  oldMaturityDate: "2025-01-01",
  oldInterest: "3",
  earlyTerminationInterest: "1",
  oldTax: "15.4",
  newInterest: "6",
  newTax: "15.4",
  switchingCost: "0",
};

test("윤년을 포함한 달력 일수를 정확하게 계산한다", () => {
  expect(getDaysBetween("2024-01-01", "2025-01-01")).toBe(366);
});

test("유지와 갈아타기의 세후 이자를 같은 만기일 기준으로 비교한다", () => {
  const result = calculateDepositComparison(validInputs);

  expect(result.errors).toEqual({});
  expect(result.assumptions).toEqual({
    dayCountBasis: 365,
    fullDays: 366,
    elapsedDays: 182,
    remainingDays: 184,
  });
  expect(result.keep.netInterest).toBeCloseTo(254495.34, 2);
  expect(result.switch.earlyTermination.netInterest).toBeCloseTo(42184.11, 2);
  expect(result.switch.newDeposit.netInterest).toBeCloseTo(255886.03, 2);
  expect(result.recommendation).toBe("switch");
  expect(result.difference).toBeCloseTo(43574.79, 2);
});

test("갈아타기 비용을 예상 수익에서 차감한다", () => {
  const result = calculateDepositComparison({
    ...validInputs,
    switchingCost: "50000",
  });

  expect(result.recommendation).toBe("keep");
  expect(result.difference).toBeLessThan(0);
});

test("잘못된 날짜 순서를 거부한다", () => {
  const errors = validateInputs({
    ...validInputs,
    switchDate: "2025-01-01",
  });

  expect(errors.switchDate).toBe("갈아타는 날짜는 만기일 이전이어야 합니다.");
});

test("빈 값과 허용 범위를 벗어난 금리를 거부한다", () => {
  const errors = validateInputs({
    ...validInputs,
    amount: "",
    newInterest: "101",
  });

  expect(errors.amount).toBeDefined();
  expect(errors.newInterest).toBeDefined();
});
