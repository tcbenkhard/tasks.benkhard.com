import {ZodSchema} from "zod";
import {RegistrationRequest, RegistrationRequestSchema} from "../model/registration-request";
import {ApiError, ErrorCode} from "./exception";


export const parseBody = <Type>(data: string | null, schema: ZodSchema<Type>): Type => {
    if(data === null) {
        throw new ApiError(400, 'Missing requestbody', ErrorCode.BAD_REQUEST)
    }
    try {
        const jsonData = JSON.parse(data)
        return schema.parse(jsonData)
    } catch (e) {
        throw new ApiError(400, 'Request does not match schema', ErrorCode.BAD_REQUEST)
    }
}