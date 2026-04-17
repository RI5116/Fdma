import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_INTERCEPTOR_KEY } from '../decorators/bypass-interceptor.decorator';

export interface WrappedResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  WrappedResponse<T>
> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<WrappedResponse<T>> {
    const bypassInterceptor = this.reflector.getAllAndOverride<boolean>(
      BYPASS_INTERCEPTOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If bypass flag is set, return the response as-is without wrapping
    if (bypassInterceptor) {
      return next.handle() as unknown as Observable<WrappedResponse<T>>;
    }

    return next.handle().pipe(
      map((data) => {
        // If the response already has a `success` property, pass through as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in (data as Record<string, unknown>)
        ) {
          return data as unknown as WrappedResponse<T>;
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
