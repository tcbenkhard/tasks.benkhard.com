import {ZodSchema} from "zod";
import {RegistrationRequest, RegistrationRequestSchema} from "../model/requests/registration-request";
import {ApiError, ErrorCode} from "./exception";


export const parseBody = <Type>(data: string | null, schema: ZodSchema<Type>, extras?: {[key: string]: any}): Type => {
    if(data === null) {
        throw new ApiError(400, 'Missing requestbody', ErrorCode.BAD_REQUEST)
    }
    try {
        const jsonData = JSON.parse(data)
        return schema.parse({...jsonData, ...extras})
    } catch (e) {
        throw new ApiError(400, 'Request does not match schema', ErrorCode.BAD_REQUEST)
    }
}