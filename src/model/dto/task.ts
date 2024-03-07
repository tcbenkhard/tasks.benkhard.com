import {TaskType} from "../domain/task-type";

export interface TaskSchedule {
    interval: number,
    period: 'days' | 'weeks' | 'months' | 'years'
}
export interface TaskDTO {
    parentId: string
    childId: string
    title: string
    description?: string
    priority: number
    createdBy: string
    createdAt: string
    type: TaskType
    schedule: TaskSchedule,
    dueDate: string,
    lastCompleted: string
}