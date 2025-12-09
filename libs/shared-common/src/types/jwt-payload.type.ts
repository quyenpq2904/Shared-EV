import { UserRole } from '../enums/user.enum';

export type JwtPayloadType = {
  id: string;
  sessionId: string;
  role: UserRole;
  iat: number;
  exp: number;
};
