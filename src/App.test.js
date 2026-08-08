jest.mock(
  "@vercel/analytics/react",
  () => ({ Analytics: () => null }),
  { virtual: true }
);

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import App from "./App";
import { createShareHash } from "./utils/shareUrl";

beforeEach(() => {
  jest.clearAllMocks();
  window.history.pushState({}, "", "/");
});

test("예금 비교 입력 화면을 표시한다", () => {
  const { container } = render(<App />);

  const homeLink = screen.getByRole("link", { name: "예금 갈아탈까?" });
  const adBanner = screen.getByLabelText("광고");
  const calculateButton = screen.getByRole("button", {
    name: "계산 결과 크게 보기",
  });

  expect(homeLink).toBeInTheDocument();
  expect(
    container.querySelector(".site-header").nextElementSibling
  ).toBe(adBanner);
  expect(
    screen.getByRole("link", { name: "다른 제품 보러가기" })
  ).toHaveAttribute("href", "https://pokugi.com");
  expect(
    screen.getByRole("heading", { name: "예금, 갈아타는 게 이득일까요?" })
  ).toBeInTheDocument();
  expect(calculateButton).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: /단리/ })).toBeChecked();
  expect(screen.getByRole("radio", { name: /복리/ })).not.toBeChecked();
  expect(
    screen.getByText("© 2026 Pokugi Studio. All rights reserved.")
  ).toBeInTheDocument();
});

test("복리를 선택해 계산 결과에 월복리 기준을 표시한다", () => {
  const hash = createShareHash({
    amount: "10000000",
    interestType: "compound",
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

  expect(screen.getAllByText(/월복리/).length).toBeGreaterThan(0);
  expect(
    screen.getByText(/발생한 이자를 원금에 더해 다음 달 이자를 계산했습니다/)
  ).toBeInTheDocument();
});

test("없는 주소에는 404 페이지와 홈 이동 버튼을 표시한다", () => {
  window.history.pushState({}, "", "/does-not-exist");

  render(<App />);

  expect(
    screen.getByRole("heading", { name: "페이지를 찾을 수 없습니다." })
  ).toBeInTheDocument();
  expect(screen.getByText(/5초 후/)).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: "계산 화면으로 이동" })
  );

  expect(
    screen.getByRole("heading", { name: "예금, 갈아타는 게 이득일까요?" })
  ).toBeInTheDocument();
});

test("404 페이지에서 5초 후 계산 화면으로 자동 이동한다", () => {
  jest.useFakeTimers();
  window.history.pushState({}, "", "/missing-page");

  render(<App />);
  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(
    screen.getByRole("heading", { name: "예금, 갈아타는 게 이득일까요?" })
  ).toBeInTheDocument();
  jest.useRealTimers();
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
