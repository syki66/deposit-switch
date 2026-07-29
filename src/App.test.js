import { render, screen } from "@testing-library/react";
import App from "./App";

test("예금 비교 입력 화면을 표시한다", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "예금, 갈아타는 게 이득일까요?" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "계산 결과 크게 보기" })
  ).toBeInTheDocument();
});
