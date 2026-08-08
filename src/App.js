import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import Result from "./pages/Result";
import { readInputsFromShareHash } from "./utils/shareUrl";

function Home() {
  const location = useLocation();
  return readInputsFromShareHash(location.hash) ? <Result /> : <Calculator />;
}

const removeSharedInputs = (event) => ({
  ...event,
  url: event.url.split("#")[0],
});

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="site-header__brand" to="/">
            예금 갈아탈까?
          </Link>
          <a className="site-header__products" href="https://pokugi.com">
            다른 제품 보러가기
          </a>
        </div>
      </header>
      <aside aria-label="광고" className="ad-banner">
        <ins
          className="kakao_ad_area"
          data-ad-height="100"
          data-ad-unit="DAN-Jxpxpi4KKWCZPd5Y"
          data-ad-width="320"
          style={{ display: "none" }}
        />
      </aside>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="site-footer">
        <p className="site-footer__copyright">
          © 2026 Pokugi Studio. All rights reserved.
        </p>
      </footer>
      <Analytics beforeSend={removeSharedInputs} />
    </BrowserRouter>
  );
}

export default App;
