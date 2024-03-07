import {BatchGetRequestMap, DocumentClient, KeyList} from "aws-sdk/clients/dynamodb";
import {get_variable} from "../util/env";
import {Membership} from "../model/dto/membership";
import {DateTime} from "luxon";
import {TaskDTO} from "../model/dto/task";

export class TaskTableClient {
    private dynamo: DocumentClient
    private TASK_TABLE_NAME = get_variable('TASK_TABLE_NAME')
    constructor(dynamo: DocumentClient) {
        this.dynamo = dynamo
    }

    getMembershipsForUser = async (userId: string): Promise<Array<Membership>> => {
        const membershipsResponse = await this.dynamo.query({
            TableName: this.TASK_TABLE_NAME,
            KeyConditionExpression: '#parentId = :userId and begins_with(#childId, :listPrefix)',
            ExpressionAttributeValues: {
                ":userId": `user#${userId}`,
                ":listPrefix": "list#"
            },
            ExpressionAttributeNames: {
                "#parentId": "parentId",
                "#childId": "childId"
            }
        }).promise()
        if(!membershipsResponse.Items) return []
        return membershipsResponse.Items.map(res => ({
            userId: res.parentId.substring('user#'.length),
            listId: res.childId.substring('list#'.length),
            createdAt: res.createdAt
        }))
    }

    getMembershipsForList = async (listId: string) => {
        const membershipsResponse = await this.dynamo.query({
            TableName: this.TASK_TABLE_NAME,
            KeyConditionExpression: '#parentId = :listId and begins_with(#childId, :userPrefix)',
            ExpressionAttributeValues: {
                ":listId": `list#${listId}`,
                ":userPrefix": "user#"
            },
            ExpressionAttributeNames: {
                "#parentId": "parentId",
                "#childId": "childId"
            }
        }).promise()
        if(!membershipsResponse.Items) return []
        return membershipsResponse.Items.map(res => ({
            userId: res.childId.substring('list#'.length),
            listId: res.parentId.substring('user#'.length),
            createdAt: res.createdAt
        }))
    }

    getUserListMembership = async (userId: string, listId: string): Promise<Membership|null> => {
        const membershipsResponse = await this.dynamo.get({
            TableName: this.TASK_TABLE_NAME,
            Key: {
                parentId: `user#${userId}`,
                childId: `list#${listId}`
            }
        }).promise()
        if(!membershipsResponse.Item) return null
        return {
            userId: membershipsResponse.Item.parentId.substring('user#'.length),
            listId: membershipsResponse.Item.childId.substring('list#'.length),
            createdAt: membershipsResponse.Item.createdAt
        }
    }

    getList = async (listId: string): Promise<ListDTO | null> => {
        const listResult = await this.dynamo.get({
            TableName: this.TASK_TABLE_NAME,
            Key: {
                'parentId': `list#${listId}`,
                'childId': `list#${listId}`
            },
        }).promise()

        if(!listResult.Item) return null
        return {
            id: listResult.Item.parentId.substring('list#'.length),
            title: listResult.Item.title,
            owner: listResult.Item.owner,
            createdAt: listResult.Item.createdAt
        }
        return listResult.Item as ListDTO
    }

    getListsFromMemberships = async (memberships: Array<Membership>): Promise<Array<ListDTO>> => {
        const keys = memberships.map(membership => ({parentId: `list#${membership.listId}`, childId: `list#${membership.listId}`})) as KeyList
        const requestItems: BatchGetRequestMap = {}
        requestItems[this.TASK_TABLE_NAME] = {
            Keys: keys
        }
        const allLists = await this.dynamo.batchGet({
            RequestItems: requestItems
        }).promise()

        if(!allLists.Responses) return []
        return allLists.Responses[this.TASK_TABLE_NAME].map(list => ({
            id: list.parentId.substring('list#'.length),
            title: list.title,
            owner: list.owner,
            createdAt: list.createdAt
        }))
    }

    createList = async (listDto: ListDTO) => {
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `list#${listDto.id}`,
                childId: `list#${listDto.id}`,
                title: listDto.title,
                owner: listDto.owner,
                createdAt: listDto.createdAt
            },
            ConditionExpression: 'attribute_not_exists(parentId)'
        }).promise()
        return listDto
    }

    createListMembership = async (listId: string, userId: string): Promise<Membership> => {
        const createdAt = DateTime.now()
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `list#${listId}`,
                childId: `user#${userId}`,
                createdAt: createdAt.toISODate()
            }
        }).promise()

        return {
            userId: userId,
            listId: listId,
            createdAt: createdAt.toISODate()
        }
    }

    getTasksForList = async (listId: string): Promise<Array<TaskDTO>> => {
        const result = await this.dynamo.query({
            TableName: this.TASK_TABLE_NAME,
            KeyConditionExpression: '#parentId = :listId and begins_with(#childId, :taskPrefix)',
            ExpressionAttributeValues: {
                ":listId": `list#${listId}`,
                ":taskPrefix": "task#"
            },
            ExpressionAttributeNames: {
                "#parentId": "parentId",
                "#childId": "childId"
            }
        }).promise()

        if(!result.Items) return []
        return result.Items as Array<TaskDTO>
    }

    createUserMembership = async (userId: string, listId: string) => {
        const createdAt = DateTime.now()
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: {
                parentId: `user#${userId}`,
                childId: `list#${listId}`,
                createdAt: createdAt.toISODate()
            }
        }).promise()

        return {
            userId: userId,
            listId: listId,
            createdAt: createdAt.toISODate()
        }
    }

    createTask = async (taskDto: TaskDTO) => {
        await this.dynamo.put({
            TableName: this.TASK_TABLE_NAME,
            Item: taskDto,
            ConditionExpression: 'attribute_not_exists(parentId)'
        }).promise()

        return taskDto
    }
}