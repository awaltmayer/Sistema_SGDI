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
});


