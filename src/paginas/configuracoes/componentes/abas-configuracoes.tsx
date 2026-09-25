import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/componentes/ui/abas';
import { ProfileForm } from './formulario-perfil';
import { ChangePasswordForm } from './formulario-trocar-senha';
import { ThemeToggle } from './alternador-tema';
import { DangerZone } from './zona-perigo';
import { Separator } from '@/componentes/ui/separador';

type ValorAba = 'profile' | 'general';
type TabValue = ValorAba;

const abasValidas: ValorAba[] = ['profile', 'general'];

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
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="general">Geral</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6 space-y-6">
        <ProfileForm />
        <Separator />
        <ChangePasswordForm />
      </TabsContent>

      <TabsContent value="general" className="mt-6 space-y-6">
        <ThemeToggle />
        <DangerZone />
      </TabsContent>
    </Tabs>
  );
}

export const SettingsTabs = AbasConfiguracoes;




