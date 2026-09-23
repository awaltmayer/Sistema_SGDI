import { useState } from 'react';
import { BarraSuperiorQuadro } from './componentes/barra-superior-quadro';
import { BarraFerramentasQuadro, type TipoOrdenacao } from './componentes/barra-ferramentas-quadro';
import { ColunasQuadro } from './componentes/colunas-quadro';
import './quadro-pagina.css';

export default function PaginaQuadro() {
  const caminhoBase = '/board';

  const [ordenarPor, setOrdenarPor] = useState<TipoOrdenacao>('manual');
  const [busca, setBusca] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [filtroSolicitante, setFiltroSolicitante] = useState('all');
  const [filtroResponsavel, setFiltroResponsavel] = useState('all');

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
