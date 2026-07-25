export function getAdminToken(): string | null;
export function getAdminUser(): { correo?: string } | null;
export function clearAdminSession(): void;
export function loginAdmin(credentials: {
  correo: string;
  contrasena: string;
}): Promise<unknown>;
