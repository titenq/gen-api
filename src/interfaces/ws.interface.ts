export interface IWSEvent {
  event: string;
  message: string;
}

export interface IWSAuthError {
  code: number;
  error: string;
}
