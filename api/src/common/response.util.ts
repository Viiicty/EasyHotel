export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export class ResponseUtil {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: 200,
      data,
      message,
    };
  }

  static error(message: string = 'Error', code: number = 500): ApiResponse<null> {
    return {
      code,
      data: null,
      message,
    };
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse<null> {
    return {
      code: 401,
      data: null,
      message,
    };
  }

  static notFound(message: string = 'Not Found'): ApiResponse<null> {
    return {
      code: 404,
      data: null,
      message,
    };
  }

  static badRequest(message: string = 'Bad Request'): ApiResponse<null> {
    return {
      code: 400,
      data: null,
      message,
    };
  }
}
