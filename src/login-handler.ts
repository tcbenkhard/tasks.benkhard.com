import {AuthService} from "./service/auth-service";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {InvalidCredentialsError} from "./util/exception";

const authService = new AuthService(new DocumentClient(), 'RandomSigningKeyThatIsNotRealAtAll')

const decode = (str: string):string => Buffer.from(str, 'base64').toString('binary');

export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const authHeader = event.headers?.Authorization
    if(!authService) {
        throw new InvalidCredentialsError()
    }
    const decodedHeader = decode(authHeader!.substring('Basic '.length));
    const headerValues = decodedHeader.split(':');
    return await authService.login({
        email: headerValues[0],
        password: headerValues[1]
    })
}, 200)