import {TaskResponse} from "./task-response";

export interface ListResponse {
    id: string,
    title: string,
    createdAt: string,
    owner: string
    tasks: Array<TaskResponse>
}