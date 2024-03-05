import {RegistrationRequest} from "../model/registration-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {get_variable} from "../util/env";
import {compareSync, genSaltSync, hashSync} from "bcrypt-ts";
import {ApiError, ErrorCode, InvalidCredentialsError} from "../util/exception";
import {LoginRequest} from "../model/login-request";
import * as jwt from 'jsonwebtoken'
import {JwtResponse} from "../model/jwt-response";

export class AuthService {

    private dynamo: DocumentClient
    private signingKey: string
    private USER_TABLE_NAME = get_variable('USER_TABLE_NAME')

    constructor(dynamo: DocumentClient, signingKey: string) {
        this.dynamo = dynamo
        this.signingKey = signingKey
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

    login = async (loginRequest: LoginRequest): Promise<JwtResponse> =>  {
        const getResult = await this.dynamo.get({
            TableName: this.USER_TABLE_NAME,
            Key: {
                'email': loginRequest.email
            }
        }).promise()

        if(getResult.Item == undefined)
            throw new InvalidCredentialsError()
        if(!compareSync(loginRequest.password, getResult.Item.password))
            throw new InvalidCredentialsError()

        const accessToken = jwt.sign({}, this.signingKey, {
            expiresIn: '1 day',
            subject: loginRequest.email,
        })

        const refreshToken = jwt.sign({}, this.signingKey, {
            expiresIn: '3 months',
            subject: loginRequest.email,
        })

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }
}