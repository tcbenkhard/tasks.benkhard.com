import {RegistrationRequest} from "../model/registration-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {get_variable} from "../util/env";
import {genSaltSync, hashSync} from "bcrypt-ts";
import {ApiError, ErrorCode} from "../util/exception";

export class AuthService {

    private dynamo: DocumentClient
    private USER_TABLE_NAME = get_variable('USER_TABLE_NAME')

    constructor(dynamo: DocumentClient) {
        this.dynamo = dynamo
    }

    register = async (registrationRequest: RegistrationRequest) => {
        const salt = genSaltSync(10);
        const hash = hashSync(registrationRequest.password, salt);
        try {
            await this.dynamo.put({
                TableName: this.USER_TABLE_NAME,
                Item: {
                    email: registrationRequest.email,
                    name: registrationRequest.name,
                    password: hash
                },
                ConditionExpression: 'attribute_not_exists(email)'
            }).promise()
        } catch (e: any) {
            if(e.name === 'ConditionalCheckFailedException') {
                throw new ApiError(
                    409,
                    `The email address ${registrationRequest.email} already exists.`,
                    ErrorCode.USER_ALREADY_EXISTS
                )
            }
        }
    }
}