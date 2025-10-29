import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://ymkytnhdslvkigzilbvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta3l0bmhkc2x2a2lnemlsYnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE2MTAsImV4cCI6MjA3MzI1NzYxMH0.ZJpWx1g8LOxuBfO6ohJy4OKNLZAqYtw7rFPZOZjxzdw';

// ============================================
// AUTENTICAÇÃO DE PARECERISTAS
// ============================================

export interface CadastroPareceristaData {
  email: string;
  senha: string;
  nome: string;
  cpf: string;
  rg?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_nascimento?: string;
  area_atuacao?: string;
  especialidade?: string[];
  experiencia_anos?: number;
  formacao_academica?: string;
  mini_curriculo?: string;
}

export interface LoginPareceristaData {
  email: string;
  senha: string;
}

export interface PareceristaAuthResponse {
  success: boolean;
  message: string;
  token: string;
  parecerista: any;
  user_type: 'parecerista';
}

export async function cadastrarParecerista(dados: CadastroPareceristaData): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-parecerista`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao cadastrar parecerista');
  }

  return data;
}

export async function loginParecerista(dados: LoginPareceristaData): Promise<PareceristaAuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-parecerista`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Credenciais inválidas');
  }

  return data;
}

// ============================================
// AUTENTICAÇÃO DE PROPONENTES
// ============================================

export interface CadastroProponenteData {
  email: string;
  senha: string;
  tipo: 'PF' | 'PJ' | 'Grupo' | 'COOP';
  nome: string;
  cpf?: string;
  cnpj?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  // Campos adicionais PF
  rg?: string;
  data_nascimento?: string;
  profissao?: string;
  // Campos adicionais PJ
  razao_social?: string;
  nome_fantasia?: string;
  inscricao_estadual?: string;
  nome_representante?: string;
  cpf_representante?: string;
  [key: string]: any; // Permite outros campos opcionais
}

export interface LoginProponenteData {
  email: string;
  senha: string;
}

export interface ProponenteAuthResponse {
  success: boolean;
  message: string;
  token: string;
  proponente: any;
  user_type: 'proponente';
}

export async function cadastrarProponente(dados: CadastroProponenteData): Promise<any> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/cadastrar-proponente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao cadastrar proponente');
  }

  return data;
}

export async function loginProponente(dados: LoginProponenteData): Promise<ProponenteAuthResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/auth-usuario-proponente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(dados)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Credenciais inválidas');
  }

  // Adaptar resposta para manter compatibilidade
  return {
    ...data,
    proponente: data.usuario, // Mapeando usuario para proponente
    user_type: 'proponente'
  };
}

// ============================================

// ============================================
// GERENCIAMENTO DE TOKEN (JWT CUSTOMIZADO)
// ============================================

export function saveAuthToken(token: string, userType: 'parecerista' | 'proponente', userData: any) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_type', userType);
  localStorage.setItem('user_data', JSON.stringify(userData));
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getUserType(): 'parecerista' | 'proponente' | null {
  return localStorage.getItem('user_type') as any;
}

export function getUserData(): any {
  const data = localStorage.getItem('user_data');
  return data ? JSON.parse(data) : null;
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_type');
  localStorage.removeItem('user_data');
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ============================================
// HEADERS PARA REQUISIÇÕES AUTENTICADAS
// ============================================

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`
  };
}

