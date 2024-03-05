import {AuthService} from "./service/auth-service";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {wrap_handler} from "./util/base-handler";
import {RegistrationRequestSchema} from "./model/registration-request";
import {parseBody} from "./util/validate";
import {DocumentClient} from "aws-sdk/clients/dynamodb";

const authService = new AuthService(new DocumentClient())

const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const registrationRequest = parseBody(event.body, RegistrationRequestSchema)
    await authService.register(registrationRequest)
}, 201)