import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from './response.util';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse> {
    return next.handle().pipe(
      map(data => this.transformResponse(data)),
      catchError(error => {
        throw this.transformError(error);
      }),
    );
  }

  private transformResponse(data: any): ApiResponse {
    if (this.isApiResponse(data)) {
      return data;
    }

    return {
      code: 200,
      data: data,
      message: 'Success',
    };
  }

  private transformError(error: any): HttpException {
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const response = error.getResponse();
      
      if (typeof response === 'string') {
        return new HttpException(
          {
            code: status,
            data: null,
            message: response,
          },
          status,
        );
      }
      
      return new HttpException(
        {
          code: status,
          data: null,
          message: (response as any).message || 'Error',
        },
        status,
      );
    }

    return new HttpException(
      {
        code: 500,
        data: null,
        message: error.message || 'Internal Server Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private isApiResponse(data: any): data is ApiResponse {
    return data && 
           typeof data === 'object' && 
           'code' in data && 
           'data' in data && 
           'message' in data;
  }
}
