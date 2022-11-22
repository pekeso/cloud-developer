import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, updateTodoWithImage } from '../../businessLogic/todos'
import { getUploadUrl } from '../../helpers/attachmentUtils'
import { createLogger } from '../../utils/logger'

// import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
// import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const todo = await getTodoById(todoId)
    todo.attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

    await updateTodoWithImage(todo)

    const url = await getUploadUrl(todoId)
    
    logger.info('A URL has been generated', url)

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
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
