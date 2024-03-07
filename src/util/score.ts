import {TaskDTO} from "../model/dto/task";
import {DateTime} from "luxon";

export class Score {
    static calculate = (task: TaskDTO): number => {
        const lastCompl = DateTime.fromISO(task.lastCompleted)
        const now = DateTime.now()
        const daysSinceLastCompleted = now.diff(lastCompl, 'days').toObject().days || 0
        const totalDuration = DateTime.fromISO(task.dueDate).diff(DateTime.fromISO(task.lastCompleted), 'days').toObject().days || 0
        const durationScore = daysSinceLastCompleted / totalDuration
        const priorityScore = task.priority / 5
        console.log(`Calculating score: ${durationScore} DS * ${priorityScore} PS`)
        return durationScore * priorityScore
    }
}