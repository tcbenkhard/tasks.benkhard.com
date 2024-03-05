export class MissingEnvironmentVariableError extends Error {
    constructor(key: string) {
        super(`Missing environment variable with key [${key}]`);
    }
}

export const get_variable = (key: string, default_value?: string): string => {
    const actual_value = process.env[key]
    if (actual_value) return actual_value
    if (default_value) {
        console.info(`Variable with key [${key}] is not defined, reverting to default value [${default_value}]`)
        return default_value
    }
    throw new MissingEnvironmentVariableError(key)
}