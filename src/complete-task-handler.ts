import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {parseBody} from "./util/validate";
import {GetListRequestSchema} from "./model/requests/get-list-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {AuthService} from "./service/auth-service";
import {TaskTableClient} from "./client/task-table-client";
import {TaskService} from "./service/task-service";
import {CompleteTaskRequestSchema} from "./model/requests/complete-task-request";

const documentClient = new DocumentClient()
const authService = new AuthService(documentClient, 'RandomSigningKeyThatIsNotRealAtAll')
const taskClient = new TaskTableClient(documentClient)
const taskService = new TaskService(taskClient)

export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const payload = authService.verifyAuthorizationHeader(event.headers['Authorization'])
    const request = parseBody('{}', CompleteTaskRequestSchema, {
        userId: payload.sub,
        listId: event.pathParameters!.listId,
        taskId: event.pathParameters!.taskId
    })

    return taskService.completeTask(request)
}, 200)