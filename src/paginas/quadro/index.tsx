import { useState } from 'react';
import { BarraSuperiorQuadro } from './componentes/barra-superior-quadro';
import { BarraFerramentasQuadro, type TipoOrdenacao, type ModoVisualizacao } from './componentes/barra-ferramentas-quadro';
import { ColunasQuadro } from './componentes/colunas-quadro';
import { ListaQuadro } from './componentes/lista-quadro';
import './quadro-pagina.css';

export default function PaginaQuadro() {
  const caminhoBase = '/board';

  const [ordenarPor, setOrdenarPor] = useState<TipoOrdenacao>('manual');
  const [visualizacao, setVisualizacao] = useState<ModoVisualizacao>('board');
  const [apenasMinhasTarefas, setApenasMinhasTarefas] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('all');
  const [filtroComplexidade, setFiltroComplexidade] = useState('all');

  return (
    <div className="sgdi-quadro-pagina-container">
      <BarraSuperiorQuadro />
      <BarraFerramentasQuadro
        ordenarPor={ordenarPor}
        aoMudarOrdenacao={setOrdenarPor}
        visualizacao={visualizacao}
        aoMudarVisualizacao={setVisualizacao}
        apenasMinhasTarefas={apenasMinhasTarefas}
        aoMudarApenasMinhasTarefas={setApenasMinhasTarefas}
        busca={busca}
        aoMudarBusca={setBusca}
        filtroPrioridade={filtroPrioridade}
        aoMudarFiltroPrioridade={setFiltroPrioridade}
        filtroComplexidade={filtroComplexidade}
        aoMudarFiltroComplexidade={setFiltroComplexidade}
      />
      <div className="sgdi-quadro-conteudo-area">
        {visualizacao === 'board' ? (
          <ColunasQuadro
            ordenarPor={ordenarPor}
            caminhoBase={caminhoBase}
            apenasMinhasTarefas={apenasMinhasTarefas}
            busca={busca}
            filtroPrioridade={filtroPrioridade}
            filtroComplexidade={filtroComplexidade}
          />
        ) : (
          <ListaQuadro
            ordenarPor={ordenarPor}
            caminhoBase={caminhoBase}
            apenasMinhasTarefas={apenasMinhasTarefas}
            busca={busca}
            filtroPrioridade={filtroPrioridade}
            filtroComplexidade={filtroComplexidade}
          />
        )}
      </div>
    </div>
  );
}

export const BoardPage = PaginaQuadro;
