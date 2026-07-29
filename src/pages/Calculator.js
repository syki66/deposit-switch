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
        <p className="eyebrow">DEPOSIT SWITCH CALCULATOR</p>
        <h1>예금 갈아타기 계산기</h1>
        <p>
          기존 예금을 만기까지 유지할 때와 지금 해지해 새 예금으로
          옮길 때의 세후 이자를 같은 만기일 기준으로 비교합니다.
        </p>
      </header>

      <form className="calculator-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section form-section--wide">
          <div className="section-heading">
            <span>01</span>
            <div>
              <h2>비교 기준</h2>
              <p>원금과 실제로 갈아탈 날짜를 입력해주세요.</p>
            </div>
          </div>

          <div className="field-grid field-grid--two">
            <label className="field">
              <span>예치 원금</span>
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
              <FieldError>{errors.amount}</FieldError>
            </label>

            <label className="field">
              <span>갈아타는 날짜</span>
              <input
                aria-invalid={Boolean(errors.switchDate)}
                name="switchDate"
                onChange={(event) =>
                  updateInput(event.target.name, event.target.value)
                }
                type="date"
                value={inputs.switchDate}
              />
              <FieldError>{errors.switchDate}</FieldError>
            </label>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>02</span>
            <div>
              <h2>기존 예금</h2>
              <p>은행에서 안내받은 중도해지 적용 금리를 입력하세요.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>가입일</span>
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
              <span>만기일</span>
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
              <span>약정 금리</span>
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
              <h2>새 예금</h2>
              <p>새 예금은 기존 만기일까지 운용하는 것으로 계산합니다.</p>
            </div>
          </div>

          <div className="field-grid">
            <label className="field">
              <span>새 예금 금리</span>
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
            단리·연 365일 기준이며, 중도해지 우대금리와 상품별 특약은 직접
            확인해야 합니다.
          </p>
          <button type="submit">두 선택 비교하기</button>
        </div>
      </form>
    </main>
  );
}
