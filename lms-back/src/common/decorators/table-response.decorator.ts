// dto/table-response.decorator.ts
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { TableResponseDto } from '@common/dto/table.dto';

export function ApiTableResponse(model: Type<any>) {
  return applyDecorators(
    ApiExtraModels(TableResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(TableResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
}
