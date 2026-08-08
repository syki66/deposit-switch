import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const REDIRECT_SECONDS = 5;

export default function NotFound() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      navigate("/", { replace: true });
    }, REDIRECT_SECONDS * 1000);
    const countdownTimer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(countdownTimer);
    };
  }, [navigate]);

  return (
    <main className="page-shell not-found-page">
      <section className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>
          주소가 잘못 입력되었거나 페이지가 이동되었습니다.
          <br />
          <strong aria-live="polite">{secondsLeft}초 후</strong> 계산 화면으로
          자동 이동합니다.
        </p>
        <button onClick={() => navigate("/", { replace: true })} type="button">
          계산 화면으로 이동
        </button>
      </section>
    </main>
  );
}
