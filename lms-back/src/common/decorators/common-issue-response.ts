import { ErrorResponse } from '@common/exceptions/base';
import { applyDecorators } from '@nestjs/common';
import { 
    ApiBadRequestResponse, 
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiInternalServerErrorResponse
  } from '@nestjs/swagger';
  
  export function ApiErroResponses() {
    return applyDecorators(
      ApiBadRequestResponse({
        description: 'Bad Request',
        type: ErrorResponse
      }),
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        type: ErrorResponse
      }),
      ApiForbiddenResponse({
        description: 'Forbidden',
        type: ErrorResponse
      }),
      ApiNotFoundResponse({
        description: 'Not Found',
        type: ErrorResponse
      }),
      ApiConflictResponse({
        description: 'Conflict',
        type: ErrorResponse
      }),
      ApiInternalServerErrorResponse({
        description: 'Internal Server Error',
        type: ErrorResponse
      })
    );
  }