import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentes/ui/cartao';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentes/ui/abas';
import { Separator } from '@/componentes/ui/separador';
import { BotoesAutenticacaoSocial } from '@/componentes/base/botoes-autenticacao-social';
import { IconLayoutKanban } from '@tabler/icons-react';
import { FormularioLogin } from './formulario-login';
import { FormularioCadastro } from './formulario-cadastro';
import './cartao-autenticacao.css';

export function CartaoAutenticacao() {
  const [abaAtual, setAbaAtual] = useState<'sign-in' | 'sign-up'>('sign-in');

  return (
    <div className="sgdi-cartao-auth-container">
      <Card className="sgdi-cartao-auth">
        <CardHeader className="sgdi-cartao-auth-header">
          <div className="sgdi-cartao-auth-icone-box">
            <IconLayoutKanban className="size-6 stroke-[2.2]" />
          </div>
          <CardTitle className="sgdi-cartao-auth-titulo">
            SGDI - Gestão de TI
          </CardTitle>
          <CardDescription className="sgdi-cartao-auth-descricao">
            Plataforma de Gestão de Demandas e Produtividade
          </CardDescription>
        </CardHeader>

        <CardContent className="sgdi-cartao-auth-content">
          <Tabs
            value={abaAtual}
            onValueChange={(v) => setAbaAtual(v as 'sign-in' | 'sign-up')}
            className="sgdi-cartao-auth-tabs"
          >
            <TabsList className="sgdi-cartao-auth-tabs-list">
              <TabsTrigger value="sign-in" className="font-medium text-xs sm:text-sm">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="font-medium text-xs sm:text-sm">
                Cadastrar
              </TabsTrigger>
            </TabsList>

            {/* Login com Google SSO */}
            <div className="sgdi-cartao-auth-sso-container">
              <BotoesAutenticacaoSocial
                mode={abaAtual === 'sign-up' ? 'signup' : 'signin'}
                providers={['google']}
              />
            </div>

            <div className="sgdi-cartao-auth-divisor-relativo">
              <Separator />
              <span className="sgdi-cartao-auth-divisor-texto">
                ou com e-mail
              </span>
            </div>

            <TabsContent value="sign-in" className="sgdi-cartao-auth-tab-content">
              <FormularioLogin aoAlternarAba={() => setAbaAtual('sign-up')} />
            </TabsContent>

            <TabsContent value="sign-up" className="sgdi-cartao-auth-tab-content">
              <FormularioCadastro aoAlternarAba={() => setAbaAtual('sign-in')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export const AuthCard = CartaoAutenticacao;
