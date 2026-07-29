import { render, screen } from "@testing-library/react";
import App from "./App";

test("예금 비교 입력 화면을 표시한다", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "예금 갈아타기 계산기" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "두 선택 비교하기" })
  ).toBeInTheDocument();
});
