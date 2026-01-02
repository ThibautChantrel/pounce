export const ERROR_CODES = {
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',

  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',

  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const

export type ErrorCode = keyof typeof ERROR_CODES

export class BusinessError extends Error {
  public readonly code: ErrorCode

  constructor(code: ErrorCode, message?: string) {
    super(message || code)
    this.code = code
    this.name = 'BusinessError'
  }
}
