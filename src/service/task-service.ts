import {CreateListRequest} from "../model/requests/create-list-request";
import {randomUUID} from "crypto";
import {ListResponse} from "../model/response/list-response";
import {GetListsRequest} from "../model/requests/get-lists-request";
import {CreateTaskRequest} from "../model/requests/create-task-request";
import {CreateTaskResponse} from "../model/response/create-task-response";
import {DateTime, Duration} from 'luxon'
import {TaskDTO, TaskSchedule} from "../model/dto/task";
import {TaskTableClient} from "../client/task-table-client";
import {ListNotFoundError, UnauthorizedError} from "../util/exception";
import {GetListRequest} from "../model/requests/get-list-request";

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

    private taskClient: TaskTableClient
    constructor(taskClient: TaskTableClient) {
        this.taskClient = taskClient
    }

    assertUserIsMember = async (userId: string, listId: string) => {
        const membership = await this.taskClient.getUserListMembership(userId, listId)
        if(!membership) throw new UnauthorizedError()
    }

    getListsForUser = async (request: GetListsRequest): Promise<Array<ListResponse>> =>  {
        const userMemberships = await this.taskClient.getMembershipsForUser(request.owner)
        const userLists = await this.taskClient.getListsFromMemberships(userMemberships)

        return userLists
    }
    createList = async (request: CreateListRequest): Promise<ListResponse> => {
        const currentDate = DateTime.now()
        const listDto = await this.taskClient.createList({
            createdAt: currentDate.toISODate(),
            owner: request.owner,
            title: request.title,
            id: randomUUID()
        })

        await Promise.all([
            this.taskClient.createListMembership(listDto.id, request.owner),
            this.taskClient.createUserMembership(request.owner, listDto.id)
        ])

        return {
            id: listDto.id,
            title: listDto.title,
            owner: listDto.owner,
            createdAt: listDto.createdAt
        }
    }

    getList = async (request: GetListRequest): Promise<ListDTO> => {
        await this.assertUserIsMember(request.userId, request.listId)

        const list = await this.taskClient.getList(request.listId)
        if(list === null) throw new ListNotFoundError(request.listId)
        return list
    }

    calculateScore = (task: TaskDTO) => {
        const daysSinceLastCompleted = DateTime.now().diff(DateTime.fromISO(task.lastCompleted)).days
        const totalDuration = DateTime.fromISO(task.lastCompleted).diff(DateTime.fromISO(task.dueDate)).days
        const durationScore = daysSinceLastCompleted/totalDuration
        const priorityScore = task.priority / 5
        return durationScore * priorityScore
    }

    parseDuration = (schedule: TaskSchedule) => {
        const durationConfig: {[key: string]: number} = {}
        durationConfig[schedule.period] = schedule.interval
        return Duration.fromObject(durationConfig)
    }

    createTask = async (request: CreateTaskRequest): Promise<CreateTaskResponse> => {
        const taskId = randomUUID({})
        const currentDate = DateTime.now().toISODate()

        const taskDto = await this.taskClient.createTask({
            parentId: `list#${request.listId}`,
            childId: `task#${taskId}`,
            title: request.title,
            description: request.description,
            priority: request.priority,
            createdBy: request.createdBy,
            createdAt: currentDate,
            type: request.type,
            schedule: request.schedule,
            dueDate: request.startAt,
            lastCompleted: DateTime.fromISO(request.startAt).minus(this.parseDuration(request.schedule)).toISODate()!
        })

        return {
            title: taskDto.title,
            description: taskDto.description,
            priority: taskDto.priority,
            createdBy: taskDto.createdBy,
            createdAt: taskDto.createdAt,
            type: taskDto.type,
            schedule: taskDto.schedule,
            dueDate: taskDto.dueDate,
            lastCompleted: taskDto.lastCompleted,
            score: this.calculateScore(taskDto)
        }
    }
}