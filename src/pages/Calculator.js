import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateDepositComparison } from "../domain/depositCalculator";
import { addComma, removeComma } from "../utils/validator";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialInputs = {
  amount: "",
  switchDate: getToday(),
  oldStartDate: "",
  oldMaturityDate: "",
  oldInterest: "",
  earlyTerminationInterest: "0.1",
  oldTax: "15.4",
  newInterest: "",
  newTax: "15.4",
  switchingCost: "0",
};

const FieldError = ({ children }) =>
  children ? <span className="field-error">{children}</span> : null;

export default function Calculator() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState(initialInputs);
  const [errors, setErrors] = useState({});

  const updateInput = (name, value) => {
    setInputs((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleMoneyChange = (event) => {
    const { name, value } = event.target;
    const normalized = removeComma(value);

    if (/^\d*$/.test(normalized) && normalized.length <= 15) {
      updateInput(name, normalized);
    }
  };

  const handleRateChange = (event) => {
    const { name, value } = event.target;

    if (/^\d{0,3}(\.\d{0,4})?$/.test(value)) {
      updateInput(name, value);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = calculateDepositComparison(inputs);

    if (Object.keys(result.errors).length > 0) {
      setErrors(result.errors);
      return;
    }

    sessionStorage.setItem("depositInputs", JSON.stringify(inputs));
    sessionStorage.setItem("depositResult", JSON.stringify(result));
    navigate("/result");
  };

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">쉽고 정확한 예금 이자 비교</p>
        <h1>예금, 갈아타는 게 이득일까요?</h1>
        <p>
          기존 예금을 그대로 둘 때와 새 예금으로 옮길 때를 비교해드립니다.
          아래 내용을 위에서부터 차례대로 입력하세요.
        </p>
        <div className="privacy-note">입력하신 정보는 외부로 전송되지 않습니다.</div>
      </header>

      <form className="calculator-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section form-section--wide">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>비교할 금액</h2>
              <p>현재 기존 예금에 넣어둔 원금을 입력하세요.</p>
            </div>
          </div>

          <div className="field-grid field-grid--single">
            <label className="field">
              <span>예치 원금 <em>필수</em></span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.amount)}
                  inputMode="numeric"
                  name="amount"
                  onChange={handleMoneyChange}
                  placeholder="10,000,000"
                  value={addComma(inputs.amount)}
                />
                <b>원</b>
              </div>
              <small className="field-help">예: 천만 원이면 10,000,000 입력</small>
              <FieldError>{errors.amount}</FieldError>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>기존 예금 정보</h2>
              <p>현재 가입되어 있는 예금의 내용을 입력하세요.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>가입한 날짜 <em>필수</em></span>
              <input
                aria-invalid={Boolean(errors.oldStartDate)}
                name="oldStartDate"
                onChange={(event) =>
                  updateInput(event.target.name, event.target.value)
                }
                type="date"
                value={inputs.oldStartDate}
              />
              <FieldError>{errors.oldStartDate}</FieldError>
            </label>

            <label className="field">
              <span>만기 날짜 <em>필수</em></span>
              <input
                aria-invalid={Boolean(errors.oldMaturityDate)}
                name="oldMaturityDate"
                onChange={(event) =>
                  updateInput(event.target.name, event.target.value)
                }
                type="date"
                value={inputs.oldMaturityDate}
              />
              <FieldError>{errors.oldMaturityDate}</FieldError>
            </label>

            <label className="field">
              <span>약정 금리 <em>필수</em></span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.oldInterest)}
                  inputMode="decimal"
                  name="oldInterest"
                  onChange={handleRateChange}
                  placeholder="3.5"
                  value={inputs.oldInterest}
                />
                <b>%</b>
              </div>
              <FieldError>{errors.oldInterest}</FieldError>
            </label>

            <label className="field">
              <span>중도해지 적용 금리</span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.earlyTerminationInterest)}
                  inputMode="decimal"
                  name="earlyTerminationInterest"
                  onChange={handleRateChange}
                  value={inputs.earlyTerminationInterest}
                />
                <b>%</b>
              </div>
              <small className="field-help">
                모르면 은행 앱이나 고객센터에서 확인하세요.
              </small>
              <FieldError>{errors.earlyTerminationInterest}</FieldError>
            </label>

            <label className="field">
              <span>이자 과세율</span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.oldTax)}
                  inputMode="decimal"
                  name="oldTax"
                  onChange={handleRateChange}
                  value={inputs.oldTax}
                />
                <b>%</b>
              </div>
              <FieldError>{errors.oldTax}</FieldError>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>03</span>
            <div>
              <h2>새 예금 정보</h2>
              <p>새로 가입하려는 예금의 내용을 입력하세요.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field field--wide">
              <span>새 예금 가입 예정일 <em>필수</em></span>
              <input
                aria-invalid={Boolean(errors.switchDate)}
                name="switchDate"
                onChange={(event) =>
                  updateInput(event.target.name, event.target.value)
                }
                type="date"
                value={inputs.switchDate}
              />
              <small className="field-help">
                기존 예금을 해지하고 새 예금에 가입할 날짜입니다.
              </small>
              <FieldError>{errors.switchDate}</FieldError>
            </label>

            <label className="field">
              <span>새 예금 금리 <em>필수</em></span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.newInterest)}
                  inputMode="decimal"
                  name="newInterest"
                  onChange={handleRateChange}
                  placeholder="4.0"
                  value={inputs.newInterest}
                />
                <b>%</b>
              </div>
              <FieldError>{errors.newInterest}</FieldError>
            </label>

            <label className="field">
              <span>이자 과세율</span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.newTax)}
                  inputMode="decimal"
                  name="newTax"
                  onChange={handleRateChange}
                  value={inputs.newTax}
                />
                <b>%</b>
              </div>
              <FieldError>{errors.newTax}</FieldError>
            </label>

            <label className="field">
              <span>갈아타기 추가 비용</span>
              <div className="input-with-unit">
                <input
                  aria-invalid={Boolean(errors.switchingCost)}
                  inputMode="numeric"
                  name="switchingCost"
                  onChange={handleMoneyChange}
                  value={addComma(inputs.switchingCost)}
                />
                <b>원</b>
              </div>
              <FieldError>{errors.switchingCost}</FieldError>
            </label>
          </div>
        </section>

        <div className="submit-area">
          <p>
            새 예금 이자는 가입 예정일부터 기존 예금 만기일까지 계산합니다.
            실제 수령액은 은행 규정에 따라 달라질 수 있습니다.
          </p>
          <button type="submit">계산 결과 크게 보기</button>
        </div>
      </form>
    </main>
  );
}
