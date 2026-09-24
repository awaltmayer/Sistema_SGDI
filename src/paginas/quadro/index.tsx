import { useState, useMemo } from 'react';
import { BarraSuperiorQuadro } from './componentes/barra-superior-quadro';
import { BarraFerramentasQuadro, type TipoOrdenacao } from './componentes/barra-ferramentas-quadro';
import { ColunasQuadro } from './componentes/colunas-quadro';
import { useDataProvider } from '@/lib/provedor-dados';
import './quadro-pagina.css';

export default function PaginaQuadro() {
  const caminhoBase = '/board';

  const [ordenarPor, setOrdenarPor] = useState<TipoOrdenacao>('manual');
  const [busca, setBusca] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [filtroSolicitante, setFiltroSolicitante] = useState('all');
  const [filtroResponsavel, setFiltroResponsavel] = useState('all');

  const { useCards } = useDataProvider();
  const { data: cartoes = [] } = useCards();

  const termoBusca = busca.trim().toLowerCase();

  const cartoesVisiveis = useMemo(() => {
    return (cartoes ?? []).filter((c) => {
      const tit = (c.titulo ?? c.title ?? '').toLowerCase();
      if (termoBusca && !tit.includes(termoBusca)) {
        return false;
      }
      const prio = c.prioridade ?? c.priority;
      if (filtroPrioridade !== 'all' && prio !== filtroPrioridade) {
        return false;
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
  }, [cartoes, termoBusca, filtroPrioridade, filtroSolicitante, filtroResponsavel]);

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
        filtroSolicitante={filtroSolicitante}
        aoMudarFiltroSolicitante={setFiltroSolicitante}
        filtroResponsavel={filtroResponsavel}
        aoMudarFiltroResponsavel={setFiltroResponsavel}
        cartoesVisiveis={cartoesVisiveis}
      />
      <div className="sgdi-quadro-conteudo-area">
        <ColunasQuadro
          ordenarPor={ordenarPor}
          caminhoBase={caminhoBase}
          busca={busca}
          filtroPrioridade={filtroPrioridade}
          filtroSolicitante={filtroSolicitante}
          filtroResponsavel={filtroResponsavel}
        />
      </div>
    </div>
  );
}

export const BoardPage = PaginaQuadro;
