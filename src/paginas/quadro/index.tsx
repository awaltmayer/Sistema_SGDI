import { useState, useMemo } from 'react';
import { BarraSuperiorQuadro } from './componentes/barra-superior-quadro';
import { BarraFerramentasQuadro, type TipoOrdenacao } from './componentes/barra-ferramentas-quadro';
import { ColunasQuadro } from './componentes/colunas-quadro';
import { TabelaDemandas } from './componentes/tabela-demandas';
import { ordenarCartoes } from './componentes/ordenar-cartoes';
import { useDataProvider } from '@/lib/provedor-dados';
import './quadro-pagina.css';

export default function PaginaQuadro() {
  const caminhoBase = '/board';

  const [ordenarPor, setOrdenarPor] = useState<TipoOrdenacao>('manual');
  const [busca, setBusca] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [filtroSolicitante, setFiltroSolicitante] = useState('all');
  const [filtroResponsavel, setFiltroResponsavel] = useState('all');
  const [modoExibicao, setModoExibicao] = useState<'quadro' | 'lista'>('quadro');

  const { useCards } = useDataProvider();
  const { data: cartoes = [] } = useCards();

  const termoBusca = busca.trim().toLowerCase();

  const cartoesVisiveis = useMemo(() => {
    return (cartoes ?? []).filter((c) => {
      if (termoBusca) {
        const idLimpo = termoBusca.startsWith('#') ? termoBusca.slice(1).trim() : termoBusca;
        const idStr = String(c.id).toLowerCase();
        const idComHash = `#${c.id}`.toLowerCase();
        const tit = (c.titulo ?? c.title ?? '').toLowerCase();
        const desc = (c.descricao ?? c.description ?? '').toLowerCase();

        const matchId = (idLimpo && idStr === idLimpo) || idComHash === termoBusca || (idLimpo && idStr.includes(idLimpo));
        const matchTexto = tit.includes(termoBusca) || desc.includes(termoBusca);

        if (!matchId && !matchTexto) {
          return false;
        }
      }
      const prio = c.prioridade ?? c.priority;
      if (filtroPrioridade !== 'all' && prio !== filtroPrioridade) {
        return false;
      }
      if (filtroStatus !== 'all') {
        const col = c.coluna ?? c.column;
        if (col !== filtroStatus) {
          return false;
        }
      }
      if (filtroSolicitante !== 'all') {
        const idCriador = c.id_usuario ?? c.user_id;
        if (!idCriador || String(idCriador) !== String(filtroSolicitante)) {
          return false;
        }
      }
      if (filtroResponsavel !== 'all') {
        const idsResp = (c.ids_responsaveis ?? c.assignee_ids ?? (c.id_responsavel ? [String(c.id_responsavel)] : [])).map(String);
        if (filtroResponsavel === 'unassigned') {
          if (idsResp.length > 0) return false;
        } else {
          if (!idsResp.includes(String(filtroResponsavel))) return false;
        }
      }
      return true;
    });
  }, [cartoes, termoBusca, filtroPrioridade, filtroStatus, filtroSolicitante, filtroResponsavel]);

  const cartoesOrdenados = useMemo(() => {
    return ordenarCartoes(cartoesVisiveis, ordenarPor);
  }, [cartoesVisiveis, ordenarPor]);

  return (
    <div className="sgdi-quadro-pagina-container">
      <BarraSuperiorQuadro />
      <BarraFerramentasQuadro
        ordenarPor={ordenarPor}
        aoMudarOrdenacao={setOrdenarPor}
        busca={busca}
        aoMudarBusca={setBusca}
        filtroPrioridade={filtroPrioridade}
        aoMudarFiltroPrioridade={setFiltroPrioridade}
        filtroStatus={filtroStatus}
        aoMudarFiltroStatus={setFiltroStatus}
        filtroSolicitante={filtroSolicitante}
        aoMudarFiltroSolicitante={setFiltroSolicitante}
        filtroResponsavel={filtroResponsavel}
        aoMudarFiltroResponsavel={setFiltroResponsavel}
        cartoesVisiveis={cartoesVisiveis}
        modoExibicao={modoExibicao}
        aoMudarModoExibicao={setModoExibicao}
      />
      <div className="sgdi-quadro-conteudo-area">
        {modoExibicao === 'quadro' ? (
          <ColunasQuadro
            ordenarPor={ordenarPor}
            caminhoBase={caminhoBase}
            busca={busca}
            filtroPrioridade={filtroPrioridade}
            filtroStatus={filtroStatus}
            filtroSolicitante={filtroSolicitante}
            filtroResponsavel={filtroResponsavel}
          />
        ) : (
          <div className="p-4 md:p-6 w-full max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
            <TabelaDemandas
              cartoes={cartoesOrdenados}
              caminhoBase={caminhoBase}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const BoardPage = PaginaQuadro;
