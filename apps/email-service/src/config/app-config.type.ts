export type AppConfig = {
  name: string;
  port: number;
  kafkaBroker: string;
  mailHost?: string;
  mailPort?: number;
  mailUser?: string;
  mailPassword?: string;
  defaultEmail?: string;
  defaultName?: string;
  redisHost?: string;
  redisPort?: number;
};
