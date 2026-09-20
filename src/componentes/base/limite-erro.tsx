import { Component, type ErrorInfo, type ReactNode } from "react";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
}

interface State {
  temErro: boolean;
  erro: Error | null;
}

export class LimiteErro extends Component<Props, State> {
  public state: State = {
    temErro: false,
    erro: null,
  };

  public static getDerivedStateFromError(erro: Error): State {
    return { temErro: true, erro };
  }

  public componentDidCatch(erro: Error, erroInfo: ErrorInfo) {
    console.error("Erro capturado pelo LimiteErro:", erro, erroInfo);
  }

  public render() {
    if (this.state.temErro) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-lg text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <IconAlertTriangle className="size-6" />
            </div>
            <h2 className="text-xl font-bold">Algo deu errado</h2>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado ao carregar a aplicação.
            </p>
            {this.state.erro && (
              <div className="text-left bg-muted p-3 rounded-md text-xs font-mono text-destructive overflow-auto max-h-40 break-words">
                {this.state.erro.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full"
            >
              <IconRefresh className="size-4" />
              Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
