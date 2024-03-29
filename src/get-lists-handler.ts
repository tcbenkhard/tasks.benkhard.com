import {wrap_handler} from "./util/base-handler";
import {APIGatewayProxyEvent, Context} from "aws-lambda";
import {parseBody} from "./util/validate";
import {CreateListRequestSchema} from "./model/requests/create-list-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {AuthService} from "./service/auth-service";
import {TaskService} from "./service/task-service";
import {GetListsRequestSchema} from "./model/requests/get-lists-request";
import {TaskTableClient} from "./client/task-table-client";

const documentClient = new DocumentClient()
const authService = new AuthService(documentClient, 'RandomSigningKeyThatIsNotRealAtAll')
const taskClient = new TaskTableClient(documentClient)
const taskService = new TaskService(taskClient)
export const handler = wrap_handler(async (event: APIGatewayProxyEvent, context: Context) => {
    const payload = authService.verifyAuthorizationHeader(event.headers['Authorization'])
    const request = parseBody('{}', GetListsRequestSchema, {
        owner: payload.sub
    })

    return taskService.getListsForUser(request)
}, 200)