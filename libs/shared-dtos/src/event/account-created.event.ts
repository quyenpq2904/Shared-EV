export class AccountCreatedEvent {
  constructor(
    public readonly accountId: string,
    public readonly email: string,
    public readonly fullName: string
  ) {}
}
