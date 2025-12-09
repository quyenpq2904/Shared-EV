export type AppConfig = {
  name: string;
  port: number;
  kafkaBroker: string;
  kafkaGroupId: string;
  grpcUrl: string;
};
