import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {AuthService} from "./service/auth-service";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {TaskService} from "./service/task-service";
import {parseBody} from "./util/validate";
import {CreateListRequestSchema} from "./model/requests/create-list-request";

const documentClient = new DocumentClient()
const authService = new AuthService(documentClient, 'RandomSigningKeyThatIsNotRealAtAll')
const taskService = new TaskService(documentClient)

export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const payload = authService.verifyAuthorizationHeader(event.headers['Authorization'])
    const request = parseBody(event.body, CreateListRequestSchema, {
        owner: payload.sub
    })

    return taskService.createList(request)
}, 201)