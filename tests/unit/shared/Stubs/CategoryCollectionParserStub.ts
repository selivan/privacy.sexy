import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { getEnumValues } from '@/application/Common/Enum';
import type { CollectionData } from '@/application/collections/';
import { CategoryCollectionParserType } from '@/application/Parser/ApplicationParser';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class CategoryCollectionParserStub {
  public readonly arguments = new Array<{
    data: CollectionData,
    info: ProjectInformation,
  }>();

  private readonly returnValues = new Map<CollectionData, ICategoryCollection>();

  public withReturnValue(
    data: CollectionData,
    collection: ICategoryCollection,
  ): this {
    this.returnValues.set(data, collection);
    return this;
  }

  public getStub(): CategoryCollectionParserType {
    return (data: CollectionData, info: IProjectInformation) => {
      this.arguments.push({ data, info });
      if (this.returnValues.has(data)) {
        return this.returnValues.get(data);
      }
      // Get next OS with a unique OS so mock does not result in an invalid app due to duplicated OS
      // collections.
      const currentRun = this.arguments.length - 1;
      const nextOs = getEnumValues(OperatingSystem)[currentRun];
      return new CategoryCollectionStub()
        .withOs(nextOs);
    };
  }
}
