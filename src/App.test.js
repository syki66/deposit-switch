jest.mock(
  "@vercel/analytics/react",
  () => ({ Analytics: () => null }),
  { virtual: true }
);

import { render, screen } from "@testing-library/react";
import App from "./App";
import { createShareHash } from "./utils/shareUrl";

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

test("예금 비교 입력 화면을 표시한다", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "예금, 갈아타는 게 이득일까요?" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "계산 결과 크게 보기" })
  ).toBeInTheDocument();
});

test("공유 링크를 열면 저장 데이터 없이 계산 결과를 표시한다", () => {
  const hash = createShareHash({
    amount: "10000000",
    switchDate: "2026-07-02",
    oldStartDate: "2026-01-01",
    oldMaturityDate: "2027-01-01",
    oldInterest: "3.5",
    earlyTerminationInterest: "0.1",
    oldTax: "15.4",
    newInterest: "4.2",
    newTax: "15.4",
    switchingCost: "0",
  });
  window.history.pushState({}, "", `/${hash}`);

  render(<App />);

  expect(
    screen.getByRole("button", { name: "결과 공유하기" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "계산 기준" })
  ).toBeInTheDocument();
});
