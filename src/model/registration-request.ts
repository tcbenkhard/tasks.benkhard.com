import * as z from 'zod'

export const RegistrationRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
})

export type RegistrationRequest = z.infer<typeof RegistrationRequestSchema>