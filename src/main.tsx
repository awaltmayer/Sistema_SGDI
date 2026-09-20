import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { LimiteErro } from "./componentes/base/limite-erro.tsx";
import "./index.css";
import "./style-pack.css";

const tema = localStorage.getItem("theme") ?? "system";
if (tema === "dark" || (tema === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(
  <LimiteErro>
    <App />
  </LimiteErro>
);




