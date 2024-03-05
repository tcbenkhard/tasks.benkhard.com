import {CreateListRequest} from "../model/requests/create-list-request";
import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {DynamoDB} from 'aws-sdk'
import {get_variable} from "../util/env";
import {randomUUID} from "crypto";
import {CreateListResponse} from "../model/response/create-list-response";

export class TaskService {
    /**
     * This table is built around the following information requests:
     * - Get user memberships
     *      QUERY user#<userId>, begins_with(list#)
     * - Get members of list
     *      QUERY list<listId>, begins_with(user#)
     * - Add member to list
     *      PUT user#userId, list#<listId>
     *      PUT list#<listId>, user#<userId>
     * - Add task to a specific list
     *      PUT list#<listId>, task#<taskId>
     * - Get all tasks of a specific list
     *      QUERY list#<listId>, begins_with(task#)
     */

    private dynamo: DocumentClient
    private TASK_TABLE_NAME = get_variable('TASK_TABLE_NAME')
    constructor(dynamo: DocumentClient) {
        this.dynamo = dynamo
    }

    createList = async (request: CreateListRequest): Promise<CreateListResponse> => {
        const listId = randomUUID({})
        const currentDate = new Date().toISOString()

        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `list#${listId}`,
                childId: `list#${listId}`,
                title: request.title,
                owner: request.owner,
                createdAt: currentDate
            },
            ConditionExpression: 'attribute_not_exists(id)'
        }).promise()
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `list#${listId}`,
                childId: `user#${request.owner}`,
                createdAt: currentDate
            }
        })
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `user#${request.owner}`,
                childId: `list#${listId}`,
                createdAt: currentDate
            }
        })

        return {
            id: listId,
            title: request.title,
            owner: request.owner,
            createdAt: currentDate
        }
    }
}