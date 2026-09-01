import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/componentes/ui/tabela';
import { Avatar, AvatarFallback, AvatarImage } from '@/componentes/ui/avatar';
import { Badge } from '@/componentes/base/distintivo';
import { Button } from '@/componentes/base/botao';
import { Card, CardContent } from '@/componentes/ui/cartao';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentes/ui/menu-selecao';
import { useDataProvider } from '@/lib/provedor-dados';
import { RemoveMemberDialog } from './dialogo-remover-membro';
import type { TeamMember } from '@/dados/dados-iniciais';

function EstadoVazioMembros({ proprietario }: { proprietario: TeamMember }) {
  const focarConvite = () => {
    const input = document.getElementById('invite-email');
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input.focus(), 300);
    }
  };

  const barra = 'rounded bg-muted h-4';

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Membros</h2>

      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    {proprietario.avatar_url && (
                      <AvatarImage src={proprietario.avatar_url} alt={proprietario.full_name} />
                    )}
                    <AvatarFallback className="text-xs">
                      {proprietario.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    {proprietario.full_name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proprietario.email}
              </TableCell>
              <TableCell>
                <Badge color="purple">Proprietário</Badge>
              </TableCell>
              <TableCell />
            </TableRow>
            {[1, 2, 3].map((i) => (
              <TableRow key={i} className="pointer-events-none" aria-hidden>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted" />
                    <div className={`${barra} w-24`} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`${barra} w-32`} />
                </TableCell>
                <TableCell>
                  <div className={`${barra} w-16`} />
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute inset-x-0 top-1/2 flex justify-center pt-[10%]">
          <Card className="pointer-events-auto shadow-lg max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <p className="text-foreground font-medium">
                Você é o único por aqui
              </p>
              <p className="text-sm text-muted-foreground">
                Convide colegas para colaborar no seu quadro.
              </p>
              <Button onClick={focarConvite}>
                Convide seu primeiro colega
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function TabelaMembros() {
  const { useTeamMembers, useUpdateMemberRole, useRemoveTeamMember } = useDataProvider();
  const { data: membros } = useTeamMembers();
  const { mutate: atualizarFuncao } = useUpdateMemberRole();
  const { mutate: revogarConvite } = useRemoveTeamMember();
  const [membroParaRemover, setMembroParaRemover] = useState<TeamMember | null>(null);

  const ativos = membros.filter((m) => m.status === 'active');
  const pendentes = membros.filter((m) => m.status === 'pending');

  const apenasProprietario = ativos.length === 1 && ativos[0].role === 'owner' && pendentes.length === 0;

  if (apenasProprietario) {
    return <EstadoVazioMembros proprietario={ativos[0]} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Membros</h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ativos.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      {member.avatar_url && (
                        <AvatarImage src={member.avatar_url} alt={member.full_name} />
                      )}
                      <AvatarFallback className="text-xs">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {member.full_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  {member.role === 'owner' ? (
                    <Badge color="purple">Proprietário</Badge>
                  ) : (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        atualizarFuncao({ memberId: member.id, role: value as 'admin' | 'member' })
                      }
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="member">Membro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMembroParaRemover(member)}
                      className="font-medium text-primary"
                    >
                      Remover
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pendentes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Convites pendentes</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge color="amber">Pendente</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revogarConvite(member.id)}
                      className="font-medium text-primary"
                    >
                      Revogar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RemoveMemberDialog
        membro={membroParaRemover}
        aoFechar={() => setMembroParaRemover(null)}
      />
    </div>
  );
}

export const MembersTable = TabelaMembros;
