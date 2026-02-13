export interface UserPayload {
  userId: string;
  tenantId: string;
  email: string;
  iat?: number;
  exp?: number;
}
