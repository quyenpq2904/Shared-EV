import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { OffsetPageOptionsDto, OffsetPaginationDto } from '../dto';

export async function paginate<T extends ObjectLiteral>(
  builder: SelectQueryBuilder<T>,
  pageOptionsDto: OffsetPageOptionsDto,
  options?: Partial<{
    skipCount: boolean;
    takeAll: boolean;
  }>
): Promise<[T[], OffsetPaginationDto]> {
  if (!options?.takeAll) {
    builder.skip(pageOptionsDto.offset).take(pageOptionsDto.limit);
  }

  const entities: T[] = await builder.getMany();

  let count = -1;

  if (!options?.skipCount) {
    count = await builder.getCount();
  }

  const metaDto = new OffsetPaginationDto(count, pageOptionsDto);

  return [entities, metaDto];
}
