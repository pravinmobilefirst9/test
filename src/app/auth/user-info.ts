export class UserInfo {
  username: string;
  roles: string[];

  constructor(username: string = 'n/a', roles: string[] = []) {
    this.username = username;
    this.roles = roles;
  }

  toString(): string {
    return `${this.username} (${this.prettyPrintedRoles()})`;
  }

  prettyPrintedRoles(): string {
    return this.roles
      .map(r => this.prettyPrintRole(r))
      .join(', ').toLowerCase();
  }

  uglyfyRoles(): string[] {
    return this.roles
      .map(r => this.prettyPrintRole(r))
  }

  prettyPrintRole(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }
}
