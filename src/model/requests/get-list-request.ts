import * as z from 'zod'

export const GetListRequestSchema = z.object({
    userId: z.string().email(),
    listId: z.string()
})

export type GetListRequest = z.infer<typeof GetListRequestSchema>