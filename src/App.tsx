import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/lib/autenticacao/provedor-autenticacao';
import { AppData } from '@/lib/provedor-dados';

// Lazy loading das páginas para divisão de bundle (Code-Splitting)
const PaginaAutenticacao = lazy(() => import('@/paginas/autenticacao'));
const RetornoOAuth = lazy(() => import('@/paginas/autenticacao/retorno-oauth'));
const PaginaQuadro = lazy(() => import('@/paginas/quadro'));
const DetalhesCartaoPagina = lazy(() =>
  import('@/paginas/quadro/componentes/detalhes-cartao-pagina').then((m) => ({
    default: m.PaginaDetalhesCartao,
  }))
);
const PaginaConfiguracoes = lazy(() => import('@/paginas/configuracoes'));
const PaginaNaoEncontrada = lazy(() => import('@/paginas/nao-encontrado'));

const clienteConsulta = new QueryClient();

function CarregandoFallback() {
  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function RedirecionamentoInicial() {
  const { usuario, carregando } = useAuth();
  if (carregando) {
    return <CarregandoFallback />;
  }
  return usuario ? <Navigate to="/board" replace /> : <Navigate to="/auth" replace />;
}

// Layout que mantém o Provedor de Dados (WebSocket Realtime) persistentemente montado entre as rotas protegidas
function LayoutAutenticado() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return <CarregandoFallback />;
  }

  if (!usuario) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppData>
      <Outlet />
    </AppData>
  );
}

const App = () => (
  <QueryClientProvider client={clienteConsulta}>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<CarregandoFallback />}>
          <Routes>
            {/* Rota inicial */}
            <Route path="/" element={<RedirecionamentoInicial />} />
            <Route path="/auth" element={<PaginaAutenticacao />} />
            
            {/* Retorno OAuth gerenciado para Google */}
            <Route path="/auth/callback" element={<RetornoOAuth />} />

            {/* Rotas protegidas envolvidas no Provedor de Dados persistente */}
            <Route element={<LayoutAutenticado />}>
              <Route path="/board" element={<PaginaQuadro />} />
              <Route
                path="/board/:cardId"
                element={<DetalhesCartaoPagina caminhoBase="/board" basePath="/board" />}
              />
              <Route path="/settings" element={<PaginaConfiguracoes />} />
            </Route>

            <Route path="*" element={<PaginaNaoEncontrada />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;



