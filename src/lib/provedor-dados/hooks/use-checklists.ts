/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integracoes/supabase/cliente";
import { useAuth } from "@/lib/autenticacao/provedor-autenticacao";
import { toast } from "sonner";
import type { Checklist, ChecklistItem, Prioridade } from "../tipos";
import { loadSupabaseChecklists, saveSupabaseChecklists } from "../storage-local";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseParamId(id: string | number | null | undefined): string | number | null {
  if (id === null || id === undefined || id === "") return null;
  const str = String(id).trim();
  if (UUID_REGEX.test(str)) return str;
  if (/^\d+$/.test(str)) return Number(str);
  return str;
}

/**
 * Atualiza o cache do React Query instantaneamente em memória (0ms),
 * tanto para a visualização do cartão aberto quanto para os cartões no quadro Kanban.
 */
function updateQueryCache(
  queryClient: any,
  cardId: string,
  updater: (lists: Checklist[]) => Checklist[]
) {
  // Atualiza cache do cartão detalhado: ["card", cardId]
  queryClient.setQueryData(["card", cardId], (oldCard: any) => {
    if (!oldCard) return oldCard;
    const oldLists: Checklist[] = oldCard.listas_verificacao ?? oldCard.checklists ?? [];
    const newLists = updater(oldLists);
    return {
      ...oldCard,
      listas_verificacao: newLists,
      checklists: newLists,
    };
  });

  // Atualiza cache da listagem do quadro: ["cards"]
  queryClient.setQueryData(["cards"], (oldCards: any[]) => {
    if (!Array.isArray(oldCards)) return oldCards;
    return oldCards.map((c) => {
      if (String(c.id) !== String(cardId)) return c;
      const oldLists: Checklist[] = c.listas_verificacao ?? c.checklists ?? [];
      const newLists = updater(oldLists);
      return {
        ...c,
        listas_verificacao: newLists,
        checklists: newLists,
      };
    });
  });
}

export function criarModuloChecklists() {
  return {
    useCreateChecklist: () => {
      const queryClient = useQueryClient();
      const { user } = useAuth();

      return {
        mutate: async ({
          cardId,
          card_id,
          title,
          titulo,
          prioridade,
          priority,
        }: {
          cardId?: string;
          card_id?: string;
          title?: string;
          titulo?: string;
          prioridade?: Prioridade;
          priority?: Prioridade;
        }) => {
          const cId = cardId ?? card_id ?? "";
          if (!cId) {
            toast.error("Cartão não identificado.");
            return;
          }

          const t = (titulo ?? title ?? "Checklist").trim() || "Checklist";
          const prio: Prioridade = prioridade ?? priority ?? "medium";

          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          if (current.length >= 5) {
            toast.error("Limite máximo de 5 checklists por cartão atingido.");
            return;
          }

          const tempId = `chk-${Date.now()}`;
          const newChecklist: Checklist = {
            id: tempId,
            id_cartao: cId,
            titulo: t,
            posicao: current.length,
            itens: [],
          };

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) => [...lists, newChecklist]);

          // Salva no storage local
          chkMap[cId] = [...current, newChecklist];
          saveSupabaseChecklists(chkMap);

          toast.success("Checklist criado com sucesso!");

          // 2. Persistência em background no Supabase
          try {
            const cardIdQuery = parseParamId(cId);
            const { data: dbChk, error: dbErr } = await supabase
              .from("checklists")
              .insert({
                id_cartao: cardIdQuery as any,
                id_usuario: user?.id,
                titulo: t,
                posicao: current.length,
              })
              .select()
              .single();

            if (!dbErr && dbChk) {
              const realChkId = String(dbChk.id);
              newChecklist.id = realChkId;

              // Atualiza o ID persistido no cache em memória e no storage
              updateQueryCache(queryClient, cId, (lists) =>
                lists.map((c) => (c.id === tempId ? { ...c, id: realChkId } : c))
              );

              chkMap[cId] = (chkMap[cId] ?? []).map((c) =>
                c.id === tempId ? { ...c, id: realChkId } : c
              );
              saveSupabaseChecklists(chkMap);
            }
          } catch (e) {
            console.warn("Checklist mantido no cache local:", e);
          }
        },
        isPending: false,
      };
    },

    useUpdateChecklist: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          title,
          titulo,
          prioridade,
          priority,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          title?: string;
          titulo?: string;
          prioridade?: Prioridade;
          priority?: Prioridade;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          const prio = prioridade ?? priority;

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) =>
            lists.map((chk) => {
              if (chk.id !== chkId) return chk;
              return {
                ...chk,
                ...(trimmed ? { titulo: trimmed, title: trimmed } : {}),
                ...(prio ? { prioridade: prio, priority: prio } : {}),
              };
            })
          );

          // Salva no storage local
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            return {
              ...chk,
              ...(trimmed ? { titulo: trimmed, title: trimmed } : {}),
              ...(prio ? { prioridade: prio, priority: prio } : {}),
            };
          });
          saveSupabaseChecklists(chkMap);

          // 2. Persistência em background no Supabase
          try {
            const chkIdQuery = parseParamId(chkId);
            const patch: Record<string, any> = {};
            if (trimmed) patch.titulo = trimmed;
            if (prio) patch.prioridade = prio;

            if (Object.keys(patch).length > 0 && chkIdQuery) {
              await supabase
                .from("checklists")
                .update(patch)
                .eq("id", chkIdQuery as any);
            }
          } catch (e) {
            console.warn("Aviso ao atualizar checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },

    useDeleteChecklist: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) =>
            lists.filter((chk) => chk.id !== chkId)
          );

          // Salva no storage local
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.filter((chk) => chk.id !== chkId);
          saveSupabaseChecklists(chkMap);

          toast.success("Checklist excluído com sucesso!");

          // 2. Persistência em background no Supabase
          try {
            const chkIdQuery = parseParamId(chkId);
            if (chkIdQuery) {
              await supabase
                .from("checklists")
                .delete()
                .eq("id", chkIdQuery as any);
            }
          } catch (e) {
            console.warn("Aviso ao excluir checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },

    useCreateChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          title,
          titulo,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          title?: string;
          titulo?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          if (!trimmed) return;

          const tempItemId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          let itemIndex = 0;

          const newItem: ChecklistItem = {
            id: tempItemId,
            id_checklist: chkId,
            titulo: trimmed,
            esta_concluido: false,
            posicao: itemIndex,
          };

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) =>
            lists.map((chk) => {
              if (chk.id !== chkId) return chk;
              const existingItems = chk.itens ?? chk.items ?? [];
              itemIndex = existingItems.length;
              newItem.posicao = itemIndex;
              return {
                ...chk,
                itens: [...existingItems, newItem],
              };
            })
          );

          // Salva no storage local
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            return {
              ...chk,
              itens: [...existingItems, newItem],
            };
          });
          saveSupabaseChecklists(chkMap);

          // 2. Persistência em background no Supabase
          try {
            const chkIdQuery = parseParamId(chkId);
            if (chkIdQuery) {
              const { data: dbItem } = await supabase
                .from("itens_checklist")
                .insert({
                  id_checklist: chkIdQuery as any,
                  titulo: trimmed,
                  esta_concluido: false,
                  posicao: itemIndex,
                })
                .select()
                .single();

              if (dbItem) {
                const realId = String(dbItem.id);
                // Atualiza o ID do item no cache e storage
                updateQueryCache(queryClient, cId, (lists) =>
                  lists.map((chk) => {
                    if (chk.id !== chkId) return chk;
                    return {
                      ...chk,
                      itens: (chk.itens ?? []).map((it) =>
                        it.id === tempItemId ? { ...it, id: realId } : it
                      ),
                    };
                  })
                );

                chkMap[cId] = (chkMap[cId] ?? []).map((chk) => {
                  if (chk.id !== chkId) return chk;
                  return {
                    ...chk,
                    itens: (chk.itens ?? []).map((it) =>
                      it.id === tempItemId ? { ...it, id: realId } : it
                    ),
                  };
                });
                saveSupabaseChecklists(chkMap);
              }
            }
          } catch (e) {
            console.warn("Aviso ao inserir item de checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },

    useUpdateChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
          title,
          titulo,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
          title?: string;
          titulo?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";
          const trimmed = (titulo ?? title ?? "").trim();
          if (!trimmed) return;

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) =>
            lists.map((chk) => {
              if (chk.id !== chkId) return chk;
              const existingItems = chk.itens ?? chk.items ?? [];
              return {
                ...chk,
                itens: existingItems.map((item) =>
                  item.id === itId ? { ...item, titulo: trimmed } : item
                ),
              };
            })
          );

          // Salva no storage local
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            return {
              ...chk,
              itens: existingItems.map((item) =>
                item.id === itId ? { ...item, titulo: trimmed } : item
              ),
            };
          });
          saveSupabaseChecklists(chkMap);

          // 2. Persistência em background no Supabase
          try {
            const itemIdQuery = parseParamId(itId);
            if (itemIdQuery) {
              await supabase
                .from("itens_checklist")
                .update({ titulo: trimmed })
                .eq("id", itemIdQuery as any);
            }
          } catch (e) {
            console.warn("Aviso ao atualizar item de checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },

    useDeleteChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          updateQueryCache(queryClient, cId, (lists) =>
            lists.map((chk) => {
              if (chk.id !== chkId) return chk;
              const existingItems = chk.itens ?? chk.items ?? [];
              return {
                ...chk,
                itens: existingItems.filter((item) => item.id !== itId),
              };
            })
          );

          // Salva no storage local
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            return {
              ...chk,
              itens: existingItems.filter((item) => item.id !== itId),
            };
          });
          saveSupabaseChecklists(chkMap);

          // 2. Persistência em background no Supabase
          try {
            const itemIdQuery = parseParamId(itId);
            if (itemIdQuery) {
              await supabase
                .from("itens_checklist")
                .delete()
                .eq("id", itemIdQuery as any);
            }
          } catch (e) {
            console.warn("Aviso ao excluir item de checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },

    useToggleChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: async ({
          cardId,
          card_id,
          checklistId,
          checklist_id,
          itemId,
          item_id,
        }: {
          cardId?: string;
          card_id?: string;
          checklistId?: string;
          checklist_id?: string;
          itemId?: string;
          item_id?: string;
        }) => {
          const cId = cardId ?? card_id ?? "";
          const chkId = checklistId ?? checklist_id ?? "";
          const itId = itemId ?? item_id ?? "";

          let nextVal = false;

          // 1. ATUALIZAÇÃO VISUAL INSTANTÂNEA NO FRONTEND (0ms)
          // Isso recalcula a barra de progresso e o status no mesmo frame do clique!
          updateQueryCache(queryClient, cId, (lists) =>
            lists.map((chk) => {
              if (chk.id !== chkId) return chk;
              const existingItems = chk.itens ?? chk.items ?? [];
              return {
                ...chk,
                itens: existingItems.map((item) => {
                  if (item.id !== itId) return item;
                  nextVal = !(item.esta_concluido ?? item.is_completed);
                  return {
                    ...item,
                    esta_concluido: nextVal,
                  };
                }),
              };
            })
          );

          // Salva no storage local
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            return {
              ...chk,
              itens: existingItems.map((item) => {
                if (item.id !== itId) return item;
                return {
                  ...item,
                  esta_concluido: nextVal,
                };
              }),
            };
          });
          saveSupabaseChecklists(chkMap);

          // 2. Persistência em background no Supabase
          try {
            const itemIdQuery = parseParamId(itId);
            if (itemIdQuery) {
              await supabase
                .from("itens_checklist")
                .update({ esta_concluido: nextVal })
                .eq("id", itemIdQuery as any);
            }
          } catch (e) {
            console.warn("Aviso ao alternar item de checklist no Supabase:", e);
          }
        },
        isPending: false,
      };
    },
  };
}
