import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/componentes/ui/abas';
import { ProfileForm } from './formulario-perfil';
import { ChangePasswordForm } from './formulario-trocar-senha';
import { MembersTable } from './tabela-membros';
import { InviteForm } from './formulario-convite';
import { ThemeToggle } from './alternador-tema';
import { DangerZone } from './zona-perigo';
import { Separator } from '@/componentes/ui/separador';

type ValorAba = 'profile' | 'team' | 'general';
type TabValue = ValorAba;

const abasValidas: ValorAba[] = ['profile', 'team', 'general'];

function obterAbaDaHash(hash: string): ValorAba {
  const valor = hash.replace('#', '') as ValorAba;
  return abasValidas.includes(valor) ? valor : 'profile';
}

export function AbasConfiguracoes() {
  const localizacao = useLocation();
  const [aba, setAba] = useState<ValorAba>(() => obterAbaDaHash(localizacao.hash));

  useEffect(() => {
    setAba(obterAbaDaHash(localizacao.hash));
  }, [localizacao.hash]);

  const lidarComMudancaAba = (valor: string) => {
    const novaAba = valor as ValorAba;
    setAba(novaAba);
    window.history.replaceState(null, '', `${localizacao.pathname}#${novaAba}`);
  };

  return (
    <Tabs value={aba} onValueChange={lidarComMudancaAba}>
      <TabsList>
        <TabsTrigger value="profile" className="font-medium text-primary">Perfil</TabsTrigger>
        <TabsTrigger value="team" className="font-medium text-primary">Equipe</TabsTrigger>
        <TabsTrigger value="general" className="font-medium text-primary">Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6 space-y-6">
        <ProfileForm />
        <Separator />
        <ChangePasswordForm />
      </TabsContent>

      <TabsContent value="team" className="mt-6 space-y-6">
        <MembersTable />
        <InviteForm />
      </TabsContent>

      <TabsContent value="general" className="mt-6 space-y-6">
        <ThemeToggle />
        <DangerZone />
      </TabsContent>
    </Tabs>
  );
}

export const SettingsTabs = AbasConfiguracoes;




