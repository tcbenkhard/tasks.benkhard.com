import * as z from 'zod'

export const GetListsRequestSchema = z.object({
    owner: z.string().email()
})

export type GetListsRequest = z.infer<typeof GetListsRequestSchema>