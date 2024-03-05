export enum ErrorCode {
    BAD_REQUEST,
    USER_ALREADY_EXISTS
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