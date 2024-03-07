import {TaskDTO} from "../dto/task";

export interface CreateTaskResponse extends Partial<TaskDTO> {
    score: number
}