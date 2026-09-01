import { BarraSuperiorQuadro } from '@/paginas/quadro/componentes/barra-superior-quadro';
import { SettingsTabs } from './componentes/abas-configuracoes';
import './configuracoes-pagina.css';

export default function PaginaConfiguracoes() {
  return (
    <div className="sgdi-configuracoes-pagina-container">
      <BarraSuperiorQuadro />
      <main className="sgdi-configuracoes-main">
        <div className="sgdi-configuracoes-cabecalho">
          <h1 className="sgdi-configuracoes-titulo">Configurações</h1>
          <p className="sgdi-configuracoes-subtitulo">
            Gerencie seu perfil, equipe e preferências.
          </p>
        </div>
        <SettingsTabs />
      </main>
    </div>
  );
}

export const SettingsPage = PaginaConfiguracoes;
