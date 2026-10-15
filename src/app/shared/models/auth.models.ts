export type UserRole = 'ADMIN' | 'GESTAO' | 'TECNICO' | 'CONCORRENTE' | 'PUBLICO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departamento?: string;
  cargo?: string;
  nuit?: string;
  companyName?: string;
  companyType?: 'SINGULAR' | 'MICRO' | 'PEQUENA' | 'MEDIA' | 'GRANDE';
  areaActividade?: string;
  telefone?: string;
  active: boolean;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  loginTime: string;
}
