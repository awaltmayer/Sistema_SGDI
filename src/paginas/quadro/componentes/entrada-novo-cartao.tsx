import { useState, useRef, useEffect } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Input } from '@/componentes/ui/campo-texto';
import { Button } from '@/componentes/base/botao';
import { useDataProvider } from '@/lib/provedor-dados';
import type { ColumnId } from '@/dados/dados-iniciais';
import { cn } from '@/lib/utilitarios';
import './entrada-novo-cartao.css';

export interface PropsEntradaNovoCartao {
  column?: ColumnId;
  cardCount?: number;
  forceAdd?: boolean;
  onForceAddDone?: () => void;
  buttonClassName?: string;
  // Aliases compatibilidade
  coluna?: ColumnId;
  contagemCartoes?: number;
  forcarAdicao?: boolean;
  aoConcluirForcarAdicao?: () => void;
}
export type AddCardInputProps = PropsEntradaNovoCartao;

export function EntradaNovoCartao({
  column,
  cardCount,
  forceAdd,
  onForceAddDone,
  buttonClassName,
  coluna,
  contagemCartoes,
  forcarAdicao,
  aoConcluirForcarAdicao,
}: PropsEntradaNovoCartao) {
  const [estaEditando, setEstaEditando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const refInput = useRef<HTMLInputElement>(null);
  const { useCreateCard } = useDataProvider();
  const { mutate: createCard } = useCreateCard();

  const idColuna = coluna ?? column!;
  const contagem = contagemCartoes ?? cardCount ?? 0;
  const deveForcar = forcarAdicao ?? forceAdd;
  const concluirForcar = aoConcluirForcarAdicao ?? onForceAddDone;

  useEffect(() => {
    if (deveForcar && !estaEditando) {
      setEstaEditando(true);
      concluirForcar?.();
    }
  }, [deveForcar, estaEditando, concluirForcar]);

  useEffect(() => {
    if (estaEditando && refInput.current) {
      refInput.current.focus();
    }
  }, [estaEditando]);

  const enviarFormulario = () => {
    const textoLimpo = titulo.trim();
    if (!textoLimpo) return;
    createCard({ title: textoLimpo, column: idColuna, nextPosition: contagem });
    setTitulo('');
    setEstaEditando(false);
  };

  const aoPressionarTecla = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviarFormulario();
    } else if (e.key === 'Escape') {
      setTitulo('');
      setEstaEditando(false);
    }
  };

  if (estaEditando) {
    return (
      <div className="sgdi-entrada-novo-cartao-wrapper">
        <Input
          ref={refInput}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onKeyDown={aoPressionarTecla}
          onBlur={() => {
            if (!titulo.trim()) {
              setEstaEditando(false);
            }
          }}
          placeholder="Título do cartão…"
          className="text-sm"
        />
        <p className="sgdi-entrada-novo-cartao-dica">
          Pressione Enter para adicionar · Esc para cancelar
        </p>
      </div>
    );
  }

  return (
    <div className="sgdi-entrada-novo-cartao-wrapper">
      <Button
        variant="ghost"
        size="sm"
        className={cn("sgdi-entrada-btn-adicionar", buttonClassName)}
        onClick={() => setEstaEditando(true)}
      >
        <IconPlus className="size-4" />
        Adicionar cartão
      </Button>
    </div>
  );
}

export const AddCardInput = EntradaNovoCartao;
