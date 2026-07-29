import {
  createShareHash,
  createShareUrl,
  readInputsFromShareHash,
} from "./shareUrl";

const inputs = {
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
};

test("입력값을 공유 해시로 변환하고 다시 복원한다", () => {
  const hash = createShareHash(inputs);

  expect(hash).toMatch(/^#share=v1\./);
  expect(readInputsFromShareHash(hash)).toEqual(inputs);
});

test("공유 주소는 서버에 입력값을 보내지 않는 해시를 사용한다", () => {
  const url = createShareUrl(inputs, "https://deposit.pokugi.com");

  expect(url).toMatch(/^https:\/\/deposit\.pokugi\.com\/#share=v1\./);
  expect(url).not.toContain("10000000");
});

test("손상된 공유 주소를 거부한다", () => {
  expect(readInputsFromShareHash("#share=v1.invalid")).toBeNull();
  expect(readInputsFromShareHash("#other=value")).toBeNull();
});
