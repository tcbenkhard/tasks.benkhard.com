import * as z from 'zod'

export const CreateListRequestSchema = z.object({
    title: z.string().min(1),
    owner: z.string().email()
})

export type CreateListRequest = z.infer<typeof CreateListRequestSchema>