import * as z from 'zod'
import {TaskType} from "../domain/task-type";

/**
 * Example of a request:
 * {
 *     title: 'Dweilen',
 *     description: 'Hele huis dweilen',
 *     type: FLEX_SCHEDULE
 *     schedule: {
 *         interval: 2
 *         period: 'daily'
 *         startAt: '2024-03-06'
 *     }
 * }
 *
 * {
 *     title: 'Dweilen',
 *     description: 'Hele huis dweilen',
 *     type: FIXED_SCHEDULE
 *     schedule: {
 *         interval: 2
 *         period: 'weeks'
 *         startAt: '2024-03-06'
 *     }
 * }
 */
export const CreateTaskRequestSchema = z.object({
    title: z.string().min(1),
    listId: z.string(),
    description: z.string().default('').optional(),
    createdBy: z.string().email(),
    priority: z.number().min(1).max(5),
    type: z.nativeEnum(TaskType),
    schedule: z.object({
        interval: z.number().min(1),
        period: z.enum(['days', 'weeks', 'months', 'years']),
    }),
    startAt: z.date()
})

export type CreateTaskRequest = z.infer<typeof CreateTaskRequestSchema>