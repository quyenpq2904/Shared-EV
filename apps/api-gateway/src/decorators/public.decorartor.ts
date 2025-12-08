import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC } from '@shared-ev/shared-common';

export const Public = () => SetMetadata(IS_PUBLIC, true);
