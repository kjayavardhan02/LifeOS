import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { AppError } from '../../../backend/src/middleware/error-handler.js';

export function handleServiceError(error: unknown): never {
  if (error instanceof AppError) {
    const code = error.statusCode === 404
      ? ErrorCode.InvalidParams
      : ErrorCode.InternalError;
    throw new McpError(code, error.message);
  }

  if (error instanceof Error) {
    throw new McpError(ErrorCode.InternalError, error.message);
  }

  throw new McpError(ErrorCode.InternalError, 'An unknown error occurred');
}
