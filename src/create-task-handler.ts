import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {AuthService} from "./service/auth-service";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {TaskService} from "./service/task-service";
import {parseBody} from "./util/validate";
import {CreateListRequestSchema} from "./model/requests/create-list-request";
import {CreateTaskRequestSchema} from "./model/requests/create-task-request";
import {TaskTableClient} from "./client/task-table-client";

const documentClient = new DocumentClient()
const authService = new AuthService(documentClient, 'RandomSigningKeyThatIsNotRealAtAll')
const taskClient = new TaskTableClient(documentClient)
const taskService = new TaskService(taskClient)

export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const payload = authService.verifyAuthorizationHeader(event.headers['Authorization'])
    const request = parseBody(event.body, CreateTaskRequestSchema, {
        createdBy: payload.sub,
        listId: event.pathParameters!.listId
    })

    return taskService.createTask(request)
}, 201)