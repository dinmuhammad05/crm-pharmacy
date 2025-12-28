import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { winstonConfig } from '../winston/winston.config';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = winstonConfig;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    // Statusni aniqlash
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      const exceptionResponse: any = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const message = (exceptionResponse as any).message;
        if (Array.isArray(message)) {
          errorMessage = message.join(', ');
        } else {
          errorMessage = message || errorMessage;
        }
      }
    } else {
      // Agar HttpException bo'lmasa (masalan, kod xatosi), error message ni original xatodan olamiz
      errorMessage =
        exception instanceof Error ? exception.message : String(exception);
    }

    // --- LOG YOZISH QISMI ---
    console.log('exceptiondannnn',exception)
    // Agar serverda jiddiy xato (500) bo'lsa, Error faylga yozamiz
    if (status === 500) {
      this.logger.error(
        `Status: ${status} | Message: ${errorMessage}`,
        exception instanceof Error ? exception.stack : '', // Stack traceni ham saqlaymiz
      );
    } else {
      // Boshqa xatolarni (400, 404 va h.k.) shunchaki warning yoki info sifatida yozish mumkin
      // Bu qism ixtiyoriy, agar faqat 500 kerak bo'lsa, buni o'chirib tashlang.
      this.logger.warn(
        `Handled Exception | Status: ${status} | Message: ${errorMessage}`,
      );
    }

    const errorResponse = {
      statusCode: status,
      error: {
        message: errorMessage,
      },
    };

    res.status(status).json(errorResponse);
  }
}
