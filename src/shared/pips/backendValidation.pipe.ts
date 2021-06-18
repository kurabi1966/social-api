import { ArgumentMetadata, PipeTransform } from "@nestjs/common";

export class BackendValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return 'foo';
  }
}