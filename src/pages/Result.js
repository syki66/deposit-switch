import React, { useLayoutEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { calculateDepositComparison } from "../domain/depositCalculator";
import {
  createShareUrl,
  readInputsFromShareHash,
} from "../utils/shareUrl";
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
  const location = useLocation();
  const [shareStatus, setShareStatus] = useState("");
  const sharedInputs = readInputsFromShareHash(location.hash);
  const inputs = sharedInputs || readStoredJson("depositInputs");
  const result = inputs ? calculateDepositComparison(inputs) : null;

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  if (
    !inputs ||
    !result ||
    Object.keys(result.errors).length > 0 ||
    !result.keep ||
    !result.switch
  ) {
    return <Navigate replace to="/" />;
  }

  const shareUrl = createShareUrl(inputs);

  const copyShareUrl = () => {
    const textarea = document.createElement("textarea");
    textarea.value = shareUrl;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  };

  const handleShare = async () => {
    setShareStatus("");

    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (!copyShareUrl()) {
        throw new Error("copy failed");
      }
      setShareStatus("공유 링크를 복사했습니다.");
    } catch {
      setShareStatus(
        "링크를 복사하지 못했습니다. 주소창의 주소를 직접 복사해주세요."
      );
    }
  };

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
  const interestTypeLabel =
    result.assumptions.interestType === "compound" ? "월복리" : "단리";

  return (
    <main className="page-shell">
      <section className={`result-hero result-hero--${result.recommendation}`}>
        <p className="eyebrow">{message.kicker}</p>
        <h1>{message.title}</h1>
        <p className="result-difference">{message.difference}</p>
        <div className="result-period">
          <span>비교 원금 {formatWon(Number(inputs.amount))}</span>
          <span>이자 계산 {interestTypeLabel}</span>
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
              연 {inputs.oldInterest}% · {interestTypeLabel} · 총{" "}
              {result.assumptions.fullDays}일
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
              연 {inputs.earlyTerminationInterest}% · {interestTypeLabel} ·{" "}
              {result.assumptions.elapsedDays}일
            </p>
            <InterestBreakdown data={result.switch.earlyTermination} />
          </div>

          <div className="result-subsection">
            <h3>새 예금 운용</h3>
            <p>
              연 {inputs.newInterest}% · {interestTypeLabel} ·{" "}
              {result.assumptions.remainingDays}일
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
            모든 이자는 {interestTypeLabel}·연 365일 기준으로 계산하고 원
            단위로 반올림했습니다.
          </li>
          {result.assumptions.interestType === "compound" && (
            <li>
              복리는 연 금리를 12개월로 나눈 월 이율로 계산하며, 발생한
              이자를 원금에 더해 다음 달 이자를 계산했습니다.
            </li>
          )}
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

      <section className="share-box">
        <h2>이 결과를 다른 사람에게 보내기</h2>
        <p>
          공유 링크를 받은 사람은 같은 계산 결과를 바로 확인할 수 있습니다.
          링크에는 입력한 금액과 날짜가 포함되므로 믿을 수 있는 사람에게만
          보내주세요.
        </p>
        <div className="result-actions">
          <button
            className="share-button"
            onClick={handleShare}
            type="button"
          >
            결과 공유하기
          </button>
          <button onClick={() => navigate("/")} type="button">
            입력값 다시 계산하기
          </button>
        </div>
        <p aria-live="polite" className="share-status" role="status">
          {shareStatus}
        </p>
      </section>
    </main>
  );
}
