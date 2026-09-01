import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { AppData } from '@/lib/provedor-dados';
import PaginaNaoEncontrada from '@/paginas/nao-encontrado';
import PaginaAutenticacao from '@/paginas/autenticacao';
import RetornoOAuth from '@/paginas/autenticacao/retorno-oauth';
import PaginaQuadro from '@/paginas/quadro';
import { DetalhesCartaoPagina } from '@/paginas/quadro/componentes/detalhes-cartao-pagina';
import PaginaConfiguracoes from '@/paginas/configuracoes';

const clienteConsulta = new QueryClient();

function RedirecionamentoInicial() {
  const { usuario, carregando } = useAuth();
  if (carregando) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  return usuario ? <Navigate to="/board" replace /> : <Navigate to="/auth" replace />;
}

const App = () => (
  <QueryClientProvider client={clienteConsulta}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota inicial: Redireciona para /auth na primeira vez se não estiver logado */}
          <Route path="/" element={<RedirecionamentoInicial />} />
          <Route path="/auth" element={<PaginaAutenticacao />} />
          
          {/* Retorno OAuth gerenciado para Google */}
          <Route path="/auth/callback" element={<RetornoOAuth />} />

          {/* Rotas principais do app */}
          <Route
            path="/board"
            element={
              <AppData>
                <PaginaQuadro />
              </AppData>
            }
          />
          <Route
            path="/board/:cardId"
            element={
              <AppData>
                <DetalhesCartaoPagina caminhoBase="/board" basePath="/board" />
              </AppData>
            }
          />
          <Route
            path="/settings"
            element={
              <AppData>
                <PaginaConfiguracoes />
              </AppData>
            }
          />

          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;



