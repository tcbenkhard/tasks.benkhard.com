import {ZodSchema} from "zod";
import {RegistrationRequest, RegistrationRequestSchema} from "../model/registration-request";
import {ApiError, ErrorCode} from "./exception";


export const parseBody = <Type>(data: unknown, schema: ZodSchema<Type>): Type => {
    if(data === null) {
        throw new ApiError(400, 'Missing requestbody', ErrorCode.BAD_REQUEST)
    }
    try {
        return schema.parse(data)
    } catch (e) {
        throw new ApiError(400, 'Request does not match schema', ErrorCode.BAD_REQUEST)
    }
}

const bla = parseBody<RegistrationRequest>({}, RegistrationRequestSchema)