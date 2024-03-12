import * as z from "zod";

export const CompleteTaskRequestSchema = z.object({
    listId: z.string(),
    taskId: z.string(),
    userId: z.string().email()
})

export type CompleteTaskRequest = z.infer<typeof CompleteTaskRequestSchema>