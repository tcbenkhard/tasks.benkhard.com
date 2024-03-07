import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {parseBody} from "./util/validate";
import {GetListsRequestSchema} from "./model/requests/get-lists-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {AuthService} from "./service/auth-service";
import {TaskTableClient} from "./client/task-table-client";
import {TaskService} from "./service/task-service";
import {GetListRequestSchema} from "./model/requests/get-list-request";

const documentClient = new DocumentClient()
const authService = new AuthService(documentClient, 'RandomSigningKeyThatIsNotRealAtAll')
const taskClient = new TaskTableClient(documentClient)
const taskService = new TaskService(taskClient)

export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const payload = authService.verifyAuthorizationHeader(event.headers['Authorization'])
    const request = parseBody('{}', GetListRequestSchema, {
        userId: payload.sub,
        listId: event.pathParameters!.listId
    })

    return taskService.getList(request)
}, 200)