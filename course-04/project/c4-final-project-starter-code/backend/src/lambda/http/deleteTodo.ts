import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo, getTodoById } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

// import { deleteTodo } from '../../businessLogic/todos'
// import { getUserId } from '../utils'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    const todo = await getTodoById(todoId)
    await deleteTodo(todo)

    logger.info(`The todo with ID ${todoId} has been deleted`)
    
    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
