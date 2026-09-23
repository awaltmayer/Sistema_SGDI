import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Checklist, ChecklistItem } from "../tipos";
import { loadSupabaseChecklists, saveSupabaseChecklists } from "../storage-local";

export function criarModuloChecklists() {
  return {
    useCreateChecklist: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({ cardId, card_id, title, titulo }: { cardId?: string; card_id?: string; title?: string; titulo?: string }) => {
          const cId = cardId ?? card_id ?? "";
          const t = (titulo ?? title ?? "Checklist").trim();
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          if (current.length >= 5) {
            toast.error("Limite máximo de 5 checklists por cartão atingido");
            return;
          }
          const newChecklist: Checklist = {
            id: `chk-${Date.now()}`,
            id_cartao: cId,
            titulo: t,
            posicao: current.length,
            itens: [],
          };
          chkMap[cId] = [...current, newChecklist];
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklist: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) =>
            chk.id === chkId ? { ...chk, titulo: trimmed } : chk
          );
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklist: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.filter((chk) => chk.id !== chkId);
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useCreateChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const newItem: ChecklistItem = {
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              titulo: trimmed,
              esta_concluido: false,
              posicao: existingItems.length,
            };
            const updatedItems = [...existingItems, newItem];
            return {
              ...chk,
              itens: updatedItems,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useUpdateChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.map((item) =>
              item.id === itId ? { ...item, titulo: trimmed } : item
            );
            return {
              ...chk,
              itens: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useDeleteChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.filter((item) => item.id !== itId);
            return {
              ...chk,
              itens: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },

    useToggleChecklistItem: () => {
      const queryClient = useQueryClient();
      return {
        mutate: ({
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
          const chkMap = loadSupabaseChecklists();
          const current = chkMap[cId] ?? [];
          chkMap[cId] = current.map((chk) => {
            if (chk.id !== chkId) return chk;
            const existingItems = chk.itens ?? chk.items ?? [];
            const updated = existingItems.map((item) => {
              if (item.id !== itId) return item;
              const nextVal = !(item.esta_concluido ?? item.is_completed);
              return {
                ...item,
                esta_concluido: nextVal,
              };
            });
            return {
              ...chk,
              itens: updated,
            };
          });
          saveSupabaseChecklists(chkMap);

          queryClient.invalidateQueries({ queryKey: ["cards"] });
          queryClient.invalidateQueries({ queryKey: ["card", cId] });
        },
        isPending: false,
      };
    },
  };
}
