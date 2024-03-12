import {TaskDTO} from "../model/dto/task";
import {DateTime} from "luxon";

export class Score {
    static calculate = (task: TaskDTO): number => {
        const lastCompl = DateTime.fromISO(task.lastCompleted)
        const now = DateTime.now()
        const daysSinceLastCompleted = now.diff(lastCompl, 'days').toObject().days || 0
        const totalDuration = DateTime.fromISO(task.dueDate).diff(DateTime.fromISO(task.lastCompleted), 'days').toObject().days || 0
        const durationScore = 2 * daysSinceLastCompleted / totalDuration
        const priorityScore = 1 + (task.priority / 5)
        return durationScore * priorityScore
    }
}