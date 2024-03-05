export enum ErrorCode {
    BAD_REQUEST,
    USER_ALREADY_EXISTS,
    INVALID_CREDENTIALS
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