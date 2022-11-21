import { TodosAccess } from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { getUserId } from '../lambda/utils'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return await todoAccess.getTodosForUser(userId)
  }

export async function getTodoById(todoId: string): Promise<TodoItem> {
    return await todoAccess.getTodoById(todoId)
}

export async function updateTodoWithImage(todo: TodoItem): Promise<TodoItem> {
    return await todoAccess.updateTodoWithImage(todo)
}

export async function updateTodo(
    todo: TodoItem,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<TodoItem> {
  
    return await todoAccess.updateTodo(todo, updateTodoRequest)
  }

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    event: APIGatewayProxyEvent
  ): Promise<TodoItem> {
  
    const todoId = uuid.v4()
    const userId = getUserId(event)
  
    return await todoAccess.createTodo({
      todoId,
      userId,
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      createdAt: new Date().toISOString(),
      done: false
    })
  }

export async function deleteTodo(todo: TodoItem) {
  return await todoAccess.deleteTodo(todo)
}


