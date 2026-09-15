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
      />
      <div className="sgdi-quadro-conteudo-area">
        <ColunasQuadro
          ordenarPor={ordenarPor}
          caminhoBase={caminhoBase}
          busca={busca}
          filtroPrioridade={filtroPrioridade}
        />
      </div>
    </div>
  );
}

export const BoardPage = PaginaQuadro;
