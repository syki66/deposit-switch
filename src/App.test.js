jest.mock(
  "@vercel/analytics/react",
  () => ({ Analytics: () => null }),
  { virtual: true }
);

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { createShareHash } from "./utils/shareUrl";

beforeEach(() => {
  jest.clearAllMocks();
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

test("검증에 실패하면 첫 번째 오류 입력란으로 이동한다", async () => {
  render(<App />);
  const amountInput = document.querySelector('[name="amount"]');

  fireEvent.click(
    screen.getByRole("button", { name: "계산 결과 크게 보기" })
  );

  await waitFor(() => expect(amountInput).toHaveFocus());
  expect(amountInput.scrollIntoView).toHaveBeenCalledWith({
    behavior: "smooth",
    block: "center",
  });
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
  expect(window.scrollTo).toHaveBeenCalledWith({
    top: 0,
    left: 0,
    behavior: "auto",
  });
});
