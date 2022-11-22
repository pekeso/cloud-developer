import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate';

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly index = process.env.TODOS_CREATED_AT_INDEX) {
    }
  
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
      console.log('Getting all todos by user ID')
  
      const result = await this.docClient.query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
      }).promise()
  
      const items = result.Items
      return items as TodoItem[]
    }

    async getTodoById(todoId: string): Promise<TodoItem> {
        console.log('Getting a todo by its ID')
    
        const result = await this.docClient.query({
          TableName: this.todosTable,
          IndexName: this.index,
          KeyConditionExpression: 'todoId = :todoId',
          ExpressionAttributeValues: {
              ':todoId': todoId
          }
        }).promise()
    
        const items = result.Items

        if (items.length > 0)
            return items[0] as TodoItem
        
        return null
      }
  

    async updateTodoWithImage(todo: TodoItem): Promise<TodoItem> {
        console.log('Upload image')

        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
            userId: todo.userId,
            todoId: todo.todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': todo.attachmentUrl 
            }
        }).promise()
    
        return result.Attributes as TodoItem
    }

    async updateTodo(todo: TodoItem, updateTodoRequest: UpdateTodoRequest): Promise<TodoItem> {
        await this.docClient.update({
          TableName: this.todosTable,
          Key: {
            userId: todo.userId,
            todoId: todo.todoId
          },
          UpdateExpression: 'SET #todoName = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeValues: {
            ':name': updateTodoRequest.name,
            ':dueDate': updateTodoRequest.dueDate,
            ':done': updateTodoRequest.done
          },
          ExpressionAttributeNames: {
            "#todoName": "name"
          }
        }).promise()
    
        return todo
      }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
        TableName: this.todosTable,
        Item: todo
      }).promise()
  
      return todo
    }

    async deleteTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId: todo.userId,
                todoId: todo.todoId
            }
        }).promise()
    
        return todo
      }
  }
  
  function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }