import {TaskType} from "../domain/task-type";
import {TaskDTO, TaskSchedule} from "../dto/task";
import {Score} from "../../util/score";

export interface TaskResponse {
    id: string
    title: string
    description?: string
    priority: number
    createdBy: string
    createdAt: string
    type: TaskType
    schedule: TaskSchedule,
    dueDate: string,
    lastCompleted: string
    score: number
}

export const fromTaskDTO = (task: TaskDTO): TaskResponse => {
    return {
        id: task.childId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        type: task.type,
        schedule: task.schedule,
        dueDate: task.dueDate,
        lastCompleted: task.lastCompleted,
        score: Score.calculate(task)
    }
}