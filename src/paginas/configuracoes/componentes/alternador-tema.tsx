import { useDataProvider } from '@/lib/provedor-dados';
import { Tabs, TabsList, TabsTrigger } from '@/componentes/ui/abas';
import type { Theme } from '@/dados/dados-iniciais';

export function AlternadorTema() {
  const { useCurrentUser, useUpdateTheme } = useDataProvider();
  const { data: usuarioAtual } = useCurrentUser();
  const { mutate: atualizarTema } = useUpdateTheme();

  const temaAtual: Theme = usuarioAtual?.theme ?? 'system';

  const lidarComMudanca = (valor: string) => {
    atualizarTema(valor as Theme);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Aparência</h2>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Tema</p>
        <Tabs value={temaAtual} onValueChange={lidarComMudanca}>
          <TabsList>
            <TabsTrigger value="light" className="font-medium text-primary">Claro</TabsTrigger>
            <TabsTrigger value="dark" className="font-medium text-primary">Escuro</TabsTrigger>
            <TabsTrigger value="system" className="font-medium text-primary">Sistema</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          Escolha como o Quadro de Gestão de Projetos aparece para você.
        </p>
      </div>
    </div>
  );
}

export const ThemeToggle = AlternadorTema;

