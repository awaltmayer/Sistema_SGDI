import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis do arquivo .env
dotenv.config();

export interface ConfiguracaoAmbiente {
  porta: number;
  chaveApi: string;
  supabaseUrl: string;
  supabaseKey: string;
  ambiente: string;
}

const porta = Number(process.env.PORT) || 3001;
const chaveApi = process.env.API_KEY || 'sgdi_secret_token_integracao_externa_2026';
const supabaseUrl = process.env.SUPABASE_URL || 'https://ddwlkvpvyzwkmmhpvcqn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';
const ambiente = process.env.NODE_ENV || 'development';

if (!process.env.API_KEY) {
  console.warn(
    '[AVISO DE SEGURANÇA] A variável de ambiente API_KEY não foi explicitamente definida no arquivo .env. Utilizando chave padrão para ambiente de desenvolvimento.'
  );
}

export const config: ConfiguracaoAmbiente = {
  porta,
  chaveApi,
  supabaseUrl,
  supabaseKey,
  ambiente,
};
