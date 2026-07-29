import { Analytics } from "@vercel/analytics/react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Calculator from "./pages/Calculator";
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
      </Routes>
      <Analytics beforeSend={removeSharedInputs} />
    </BrowserRouter>
  );
}

export default App;
