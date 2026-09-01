import { Link } from "react-router-dom";
import "./nao-encontrado.css";

export default function PaginaNaoEncontrada() {
  return (
    <div className="sgdi-nao-encontrado-container">
      <div className="sgdi-nao-encontrado-caixa">
        <h1 className="sgdi-nao-encontrado-titulo">404</h1>
        <p className="sgdi-nao-encontrado-subtitulo">Página não encontrada</p>
        <Link to="/" className="sgdi-nao-encontrado-link">
          Voltar para o quadro
        </Link>
      </div>
    </div>
  );
}

export const NotFound = PaginaNaoEncontrada;
