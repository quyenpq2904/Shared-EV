import { UserRole } from '@shared-ev/shared-dtos';

export type JwtPayloadType = {
  id: string;
  sessionId: string;
  role: UserRole;
  iat: number;
  exp: number;
};
