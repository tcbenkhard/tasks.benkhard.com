import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {ApiError} from "./exception";

export const wrap_handler = (lambdaFunction: (event: APIGatewayProxyEvent, context: Context) => any, statusCode: number = 200, headers: {[key:string]: string} = {}) => async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
        const result = await lambdaFunction(event, context)
        return {
            statusCode,
            body: JSON.stringify(result),
            headers: {
                'Access-Control-Allow-Origin': '*',
                ...headers
            }
        }
    } catch (e) {
        if (e instanceof ApiError) {
            return {
                statusCode: e.statusCode,
                body: JSON.stringify(e),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    ...headers
                }
            }
        }
        console.error(e)
        return {
            statusCode: 500,
            body: JSON.stringify({
                statusCode: 500,
                reason: 'An unexpected error occurred'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                ...headers
            }
        }
    }
}