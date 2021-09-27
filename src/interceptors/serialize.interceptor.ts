import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { map, Observable } from "rxjs";

interface ClassContructor {
    new (...args: any[]): {}
}

export function Serialize(dto: ClassContructor) {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: any) {}

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Run something before a request in handled by the request handler

        return handler.handle().pipe(
            map((data: any) => {
                // Run something before the response is sent out
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true
                });
            })
        )
    }
}