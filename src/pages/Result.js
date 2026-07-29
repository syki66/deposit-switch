import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { formatWon } from "../utils/validator";

const readStoredJson = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

const InterestBreakdown = ({ data }) => (
  <>
    <div className="result-row">
      <span>세전 이자</span>
      <strong>{formatWon(data.grossInterest)}</strong>
    </div>
    <div className="result-row">
      <span>예상 세금</span>
      <strong>-{formatWon(data.tax)}</strong>
    </div>
    <div className="result-row result-row--total">
      <span>세후 이자</span>
      <strong>{formatWon(data.netInterest)}</strong>
    </div>
  </>
);

export default function Result() {
  const navigate = useNavigate();
  const inputs = readStoredJson("depositInputs");
  const result = readStoredJson("depositResult");

  if (!inputs || !result || !result.keep || !result.switch) {
    return <Navigate replace to="/" />;
  }

  const difference = Math.abs(result.difference);
  const messages = {
    switch: {
      kicker: "갈아타기 우세",
      title: "새 예금으로 갈아타는 편이 유리합니다.",
      difference: `예상 세후 이자가 ${formatWon(difference)} 더 많습니다.`,
    },
    keep: {
      kicker: "유지 우세",
      title: "기존 예금을 유지하는 편이 유리합니다.",
      difference: `예상 세후 이자가 ${formatWon(difference)} 더 많습니다.`,
    },
    equal: {
      kicker: "수익 동일",
      title: "두 선택의 예상 세후 이자가 같습니다.",
      difference: "예상 수익 차이가 없습니다.",
    },
  };
  const message = messages[result.recommendation];

  return (
    <main className="page-shell">
      <section className={`result-hero result-hero--${result.recommendation}`}>
        <p className="eyebrow">{message.kicker}</p>
        <h1>{message.title}</h1>
        <p className="result-difference">{message.difference}</p>
        <div className="result-period">
          <span>비교 원금 {formatWon(Number(inputs.amount))}</span>
          <span>
            {inputs.switchDate}부터 {inputs.oldMaturityDate}까지{" "}
            {result.assumptions.remainingDays}일
          </span>
        </div>
      </section>

      <div className="result-grid">
        <section className="result-card">
          <div className="result-card__header">
            <span>선택 A</span>
            <h2>기존 예금 유지</h2>
            <p>
              연 {inputs.oldInterest}%로 총 {result.assumptions.fullDays}일
            </p>
          </div>
          <InterestBreakdown data={result.keep} />
        </section>

        <section className="result-card">
          <div className="result-card__header">
            <span>선택 B</span>
            <h2>새 예금으로 갈아타기</h2>
            <p>중도해지 이자와 새 예금 이자의 합계</p>
          </div>

          <div className="result-subsection">
            <h3>기존 예금 중도해지</h3>
            <p>
              연 {inputs.earlyTerminationInterest}% ·{" "}
              {result.assumptions.elapsedDays}일
            </p>
            <InterestBreakdown data={result.switch.earlyTermination} />
          </div>

          <div className="result-subsection">
            <h3>새 예금 운용</h3>
            <p>
              연 {inputs.newInterest}% · {result.assumptions.remainingDays}일
            </p>
            <InterestBreakdown data={result.switch.newDeposit} />
          </div>

          <div className="result-row">
            <span>갈아타기 비용</span>
            <strong>-{formatWon(result.switch.switchingCost)}</strong>
          </div>
          <div className="result-row result-row--grand-total">
            <span>합산 세후 이자</span>
            <strong>{formatWon(result.switch.netInterest)}</strong>
          </div>
        </section>
      </div>

      <section className="assumption-box">
        <h2>계산 기준</h2>
        <ul>
          <li>
            모든 이자는 단리·연 365일 기준으로 계산하고 원 단위로
            반올림했습니다.
          </li>
          <li>
            새 예금은 기존 예금 만기일까지 원금 {formatWon(inputs.amount)}을
            운용하는 것으로 가정했습니다.
          </li>
          <li>
            중도해지 이자는 입력한 연 {inputs.earlyTerminationInterest}%를
            기존 가입일부터 갈아타는 날짜까지 적용했습니다.
          </li>
          <li>
            실제 수령액은 금융기관의 일수 산정, 중도해지 규정 및 우대 조건에
            따라 달라질 수 있습니다.
          </li>
        </ul>
      </section>

      <div className="result-actions">
        <button onClick={() => navigate("/")} type="button">
          입력값 다시 계산하기
        </button>
      </div>
    </main>
  );
}
