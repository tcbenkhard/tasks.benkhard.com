import {CreateListRequest} from "../model/requests/create-list-request";
import {BatchGetRequestMap, DocumentClient} from "aws-sdk/clients/dynamodb";
import {DynamoDB} from 'aws-sdk'
import {get_variable} from "../util/env";
import {randomUUID} from "crypto";
import {ListResponse} from "../model/response/list-response";
import {GetListsRequest} from "../model/requests/get-lists-request";

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

    getAllLists = async (request: GetListsRequest): Promise<Array<ListResponse>> =>  {
        const membershipsResponse = await this.dynamo.query({
            TableName: this.TASK_TABLE_NAME,
            KeyConditionExpression: '#parentId = :userId and begins_with(#childId, :listPrefix)',
            ExpressionAttributeValues: {
                ":userId": `user#${request.owner}`,
                ":listPrefix": "list#"
            },
            ExpressionAttributeNames: {
                "#parentId": "parentId",
                "#childId": "childId"
            }
        }).promise()
        console.log(`Memberships found: ${membershipsResponse.Items}`)
        if(!membershipsResponse.Items || membershipsResponse.Items.length < 1) return []

        const keys = membershipsResponse.Items.map(item => ({parentId: item.childId, childId: item.childId}))
        const requestItems: BatchGetRequestMap = {}
        requestItems[this.TASK_TABLE_NAME] = {
            Keys: keys
        }
        const allLists = await this.dynamo.batchGet({
            RequestItems: requestItems
        }).promise()
        return allLists.Responses as any as Array<ListResponse>
    }
    createList = async (request: CreateListRequest): Promise<ListResponse> => {
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
        }).promise()
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `user#${request.owner}`,
                childId: `list#${listId}`,
                createdAt: currentDate
            }
        }).promise()

        return {
            id: listId,
            title: request.title,
            owner: request.owner,
            createdAt: currentDate
        }
    }
}