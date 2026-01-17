export const ERROR_CODES = {
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_DOES_NOT_EXIST: 'USER_DOES_NOT_EXIST',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_NOT_VERIFIED: 'ACCOUNT_NOT_VERIFIED',

  POI_SAME_NAME_ALREADY_EXISTS: 'POI_SAME_NAME_ALREADY_EXISTS',
  POI_DOES_NOT_EXIST: 'POI_DOES_NOT_EXIST',

  NOT_FOUND: 'NOT_FOUND',

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
