import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { CartaoAutenticacao } from './componentes/cartao-autenticacao';
import './autenticacao-pagina.css';

export default function PaginaAutenticacao() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/board', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <main className="sgdi-autenticacao-pagina">
      <h1 className="sr-only">Autenticação - SGDI Gestão de TI</h1>
      <CartaoAutenticacao />
    </main>
  );
}

export const AuthPage = PaginaAutenticacao;
