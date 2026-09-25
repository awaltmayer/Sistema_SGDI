import { describe, it, expect } from "vitest";

describe("SGDI Dashboard - Suíte de Testes", () => {
  it("deve carregar o ambiente e validar a sanidade do projeto", () => {
    expect(true).toBe(true);
  });

  describe("Lógica do Filtro de Solicitante", () => {
    const cartoesExemplo = [
      { id: "1", titulo: "Tarefa 1", id_usuario: "user-uuid-1", coluna: "todo" },
      { id: "2", titulo: "Tarefa 2", id_usuario: "user-uuid-2", coluna: "in-progress" },
      { id: "3", titulo: "Tarefa 3", id_usuario: "user-uuid-1", coluna: "done" },
    ];

    it("deve retornar todos os cartões quando o filtro for 'all'", () => {
      const filtro = "all";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const criadorId = c.id_usuario;
          if (criadorId !== filtro) return false;
        }
        return true;
      });

      expect(resultado).toHaveLength(3);
    });

    it("deve filtrar apenas os cartões criados pelo ID de usuário selecionado", () => {
      const filtro = "user-uuid-1";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const criadorId = c.id_usuario;
          if (criadorId !== filtro) return false;
        }
        return true;
      });

      expect(resultado).toHaveLength(2);
      expect(resultado.every((c) => c.id_usuario === "user-uuid-1")).toBe(true);
    });

    it("deve retornar lista vazia se nenhum cartão pertencer ao ID selecionado", () => {
      const filtro = "user-uuid-inexistente";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const criadorId = c.id_usuario;
          if (criadorId !== filtro) return false;
        }
        return true;
      });

      expect(resultado).toHaveLength(0);
    });
  });

  describe("Lógica do Filtro de Responsável", () => {
    const cartoesExemplo = [
      { id: "1", titulo: "Tarefa 1", id_responsavel: "1", id_usuario: "user-1" },
      { id: "2", titulo: "Tarefa 2", id_responsavel: null, id_usuario: "user-1" },
      { id: "3", titulo: "Tarefa 3", id_responsavel: "2", id_usuario: "user-2" },
      { id: "4", titulo: "Tarefa 4", id_responsavel: undefined, id_usuario: "user-2" },
    ];

    it("deve retornar todos os cartões quando o filtro for 'all'", () => {
      const filtro = "all";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const respId = c.id_responsavel;
          if (filtro === "unassigned") {
            if (respId) return false;
          } else {
            if (respId !== filtro) return false;
          }
        }
        return true;
      });

      expect(resultado).toHaveLength(4);
    });

    it("deve filtrar apenas cartões não atribuídos quando o filtro for 'unassigned'", () => {
      const filtro = "unassigned";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const respId = c.id_responsavel;
          if (filtro === "unassigned") {
            if (respId) return false;
          } else {
            if (respId !== filtro) return false;
          }
        }
        return true;
      });

      expect(resultado).toHaveLength(2);
      expect(resultado.map((c) => c.id)).toEqual(["2", "4"]);
    });

    it("deve filtrar apenas cartões do responsável específico pelo ID", () => {
      const filtro = "1";
      const resultado = cartoesExemplo.filter((c) => {
        if (filtro !== "all") {
          const respId = c.id_responsavel;
          if (filtro === "unassigned") {
            if (respId) return false;
          } else {
            if (respId !== filtro) return false;
          }
        }
        return true;
      });

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe("1");
    });

    it("deve permitir combinar filtro de solicitante e responsável", () => {
      const filtroSolicitante = "user-1";
      const filtroResponsavel = "unassigned";

      const resultado = cartoesExemplo.filter((c) => {
        if (filtroSolicitante !== "all" && c.id_usuario !== filtroSolicitante) {
          return false;
        }
        if (filtroResponsavel !== "all") {
          const respId = c.id_responsavel;
          if (filtroResponsavel === "unassigned") {
            if (respId) return false;
          } else {
            if (respId !== filtroResponsavel) return false;
          }
        }
        return true;
      });

      expect(resultado).toHaveLength(1);
      expect(resultado[0].id).toBe("2");
    });
  });

  describe("Lógica de Exclusão de Cartão", () => {
    const listaCartoes = [
      { id: "1", titulo: "Tarefa 1", coluna: "todo" },
      { id: "2", titulo: "Tarefa 2", coluna: "in-progress" },
      { id: "3", titulo: "Tarefa 3", coluna: "done" },
    ];

    it("deve remover o cartão da lista mantendo os demais intactos", () => {
      const idParaExcluir = "2";
      const listaAtualizada = listaCartoes.filter((c) => c.id !== idParaExcluir);

      expect(listaAtualizada).toHaveLength(2);
      expect(listaAtualizada.find((c) => c.id === idParaExcluir)).toBeUndefined();
      expect(listaAtualizada.map((c) => c.id)).toEqual(["1", "3"]);
    });

    it("deve remover comentários vinculados ao cartão excluído", () => {
      const comentarios = [
        { id: "1", id_cartao: "1", conteudo: "Comentário 1" },
        { id: "2", id_cartao: "2", conteudo: "Comentário 2" },
        { id: "3", id_cartao: "2", conteudo: "Comentário 3" },
        { id: "4", id_cartao: "3", conteudo: "Comentário 4" },
      ];

      const idCartaoExcluido = "2";
      const comentariosRestantes = comentarios.filter((cmt) => cmt.id_cartao !== idCartaoExcluido);

      expect(comentariosRestantes).toHaveLength(2);
      expect(comentariosRestantes.every((cmt) => cmt.id_cartao !== "2")).toBe(true);
    });

    it("deve remover do mapa de listas de verificação locais", () => {
      const checklistsMap: Record<string, { id: string; title: string }[]> = {
        "1": [{ id: "1", title: "Checklist 1" }],
        "2": [{ id: "2", title: "Checklist 2" }],
      };

      const idCartaoExcluido = "2";
      delete checklistsMap[idCartaoExcluido];

      expect(checklistsMap["2"]).toBeUndefined();
      expect(checklistsMap["1"]).toBeDefined();
    });
  });

  describe("Regra de Negócio: Listagem Restrita nos Filtros de Usuários", () => {
    const todosUsuarios = [
      { id: "user-1", nome: "Ana" },
      { id: "user-2", nome: "Bruno" },
      { id: "user-3", nome: "Carlos (sem tarefas)" },
    ];

    const cartoes = [
      { id: "card-1", id_usuario: "user-1", id_responsavel: "user-2" },
      { id: "card-2", id_usuario: "user-1", id_responsavel: null },
    ];

    it("deve listar no filtro de solicitante apenas usuários que realmente criaram cartões", () => {
      const idsSolicitantesComCartao = new Set(
        cartoes.map((c) => c.id_usuario).filter(Boolean)
      );

      const solicitantesNoFiltro = todosUsuarios.filter((u) =>
        idsSolicitantesComCartao.has(u.id)
      );

      expect(solicitantesNoFiltro).toHaveLength(1);
      expect(solicitantesNoFiltro[0].id).toBe("user-1");
      // user-2 e user-3 não criaram cartões, não devem constar no filtro de solicitante
      expect(solicitantesNoFiltro.some((u) => u.id === "user-2")).toBe(false);
      expect(solicitantesNoFiltro.some((u) => u.id === "user-3")).toBe(false);
    });

    it("deve listar no filtro de responsável apenas usuários que possuem cartões atribuídos", () => {
      const idsResponsaveisComCartao = new Set(
        cartoes.map((c) => c.id_responsavel).filter(Boolean)
      );

      const responsaveisNoFiltro = todosUsuarios.filter((u) =>
        idsResponsaveisComCartao.has(u.id)
      );

      expect(responsaveisNoFiltro).toHaveLength(1);
      expect(responsaveisNoFiltro[0].id).toBe("user-2");
      // user-1 e user-3 não são responsáveis por nenhum cartão, não devem constar no filtro
      expect(responsaveisNoFiltro.some((u) => u.id === "user-1")).toBe(false);
      expect(responsaveisNoFiltro.some((u) => u.id === "user-3")).toBe(false);
    });

    it("deve detectar se há opção 'Não atribuído' com base na presença de cartões sem responsável", () => {
      const temNaoAtribuido = cartoes.some((c) => !c.id_responsavel);
      expect(temNaoAtribuido).toBe(true);

      const cartoesCompletos = [
        { id: "card-1", id_responsavel: "user-2" },
      ];
      const temNaoAtribuidoVazio = cartoesCompletos.some((c) => !c.id_responsavel);
      expect(temNaoAtribuidoVazio).toBe(false);
    });
  });

  describe("Sprint 1 - Ordenação por Prioridade (Importância e Urgência)", () => {
    it("deve ordenar demandas colocando Alta prioridade no topo, seguida por Média e Baixa", () => {
      const demandas = [
        { id: "1", prioridade: "low" },
        { id: "2", prioridade: "high" },
        { id: "3", prioridade: "medium" },
        { id: "4", prioridade: "high" },
      ];
      const ranking: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const ordenadas = [...demandas].sort(
        (a, b) => (ranking[a.prioridade] ?? 2) - (ranking[b.prioridade] ?? 2)
      );

      expect(ordenadas.map((d) => d.id)).toEqual(["2", "4", "3", "1"]);
    });
  });

  describe("Sprint 2 - Contagem e Vínculo de Demandas por Solicitante", () => {
    it("deve calcular a quantidade exata de demandas por solicitante", () => {
      const demandas = [
        { id: "1", id_usuario: "user-uuid-1" },
        { id: "2", id_usuario: "user-uuid-2" },
        { id: "3", id_usuario: "user-uuid-1" },
        { id: "4", id_usuario: "user-uuid-1" },
      ];

      const contagem = new Map<string, number>();
      for (const d of demandas) {
        if (d.id_usuario) {
          contagem.set(d.id_usuario, (contagem.get(d.id_usuario) ?? 0) + 1);
        }
      }

      expect(contagem.get("user-uuid-1")).toBe(3);
      expect(contagem.get("user-uuid-2")).toBe(1);
      expect(contagem.get("user-uuid-inexistente")).toBeUndefined();
    });
  });

  describe("Sprint 3 - Filtro por Status e Paginação de Demandas", () => {
    const listaDemandas = Array.from({ length: 25 }, (_, i) => ({
      id: String(i + 1),
      titulo: `Demanda ${i + 1}`,
      coluna: i % 2 === 0 ? "todo" : "in-progress",
      prioridade: i % 3 === 0 ? "high" : "medium",
    }));

    it("deve filtrar demandas pelo status/coluna selecionada", () => {
      const filtroStatus = "in-progress";
      const filtradas = listaDemandas.filter((d) => d.coluna === filtroStatus);

      expect(filtradas.length).toBe(12);
      expect(filtradas.every((d) => d.coluna === "in-progress")).toBe(true);
    });

    it("deve paginar listagem de demandas em blocos de 10 itens", () => {
      const ITENS_POR_PAGINA = 10;
      const totalPaginas = Math.ceil(listaDemandas.length / ITENS_POR_PAGINA);

      expect(totalPaginas).toBe(3);

      // Página 1
      const p1 = listaDemandas.slice(0, 10);
      expect(p1).toHaveLength(10);
      expect(p1[0].id).toBe("1");
      expect(p1[9].id).toBe("10");

      // Página 2
      const p2 = listaDemandas.slice(10, 20);
      expect(p2).toHaveLength(10);
      expect(p2[0].id).toBe("11");
      expect(p2[9].id).toBe("20");

      // Página 3 (restante)
      const p3 = listaDemandas.slice(20, 25);
      expect(p3).toHaveLength(5);
      expect(p3[0].id).toBe("21");
      expect(p3[4].id).toBe("25");
    });
  });
});



