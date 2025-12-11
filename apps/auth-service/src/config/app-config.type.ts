export type AppConfig = {
  name: string;
  port: number;
  kafkaBroker: string;
  grpcUrl: string;
  clientUrl: string;
  secret: string;
  expires: string;
  refreshSecret: string;
  refreshExpires: string;
  forgotSecret: string;
  forgotExpires: string;
  confirmEmailSecret: string;
  confirmEmailExpires: string;
  redisHost?: string;
  redisPort?: number;
};
