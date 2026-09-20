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
  const [apenasMinhas, setApenasMinhas] = useState(false);

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
        apenasMinhas={apenasMinhas}
        aoMudarApenasMinhas={setApenasMinhas}
      />
      <div className="sgdi-quadro-conteudo-area">
        <ColunasQuadro
          ordenarPor={ordenarPor}
          caminhoBase={caminhoBase}
          busca={busca}
          filtroPrioridade={filtroPrioridade}
          filtroSolicitante={filtroSolicitante}
          apenasMinhas={apenasMinhas}
        />
      </div>
    </div>
  );
}

export const BoardPage = PaginaQuadro;
