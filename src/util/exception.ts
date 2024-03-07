export enum ErrorCode {
    BAD_REQUEST,
    USER_ALREADY_EXISTS,
    INVALID_CREDENTIALS,
    LIST_NOT_FOUND,
UNAUTHORIZED
}

export class ApiError extends Error {
    public statusCode: number
    public reason: string
    public errorCode: string

    constructor(statusCode: number, reason: string, errorCode: ErrorCode) {
        super();
        this.statusCode = statusCode
        this.reason = reason
        this.errorCode = ErrorCode[errorCode]
    }
}

export class InvalidCredentialsError extends ApiError {
    constructor() {
        super(401, 'Invalid username or password.', ErrorCode.INVALID_CREDENTIALS);
    }
}

export class UnauthorizedError extends ApiError {
    constructor() {
        super(403, 'Unauthorized request', ErrorCode.UNAUTHORIZED);
    }
}

export class NotFoundError extends ApiError {
    constructor(reason: string, errorCode: ErrorCode) {
        super(404, reason, errorCode);
    }
}

export class ListNotFoundError extends NotFoundError {
    constructor(listId: string) {
        super(`A list with id ${listId} was not found.`, ErrorCode.LIST_NOT_FOUND);
    }
}