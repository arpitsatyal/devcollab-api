import { NotFoundException } from '@nestjs/common';

type DelegateWithId<Model> = {
  findUnique(args: {
    where: { id: string };
    select?: any;
    include?: any;
  }): Promise<Model | null>;
  findMany(args?: any): Promise<Model[]>;
  create(args: { data: any }): Promise<Model>;
  update(args: { where: { id: string }; data: any }): Promise<Model>;
  delete(args: { where: { id: string } }): Promise<Model>;
};

/**
 * Prisma-aware CRUD base that infers types from the delegate you pass.
 * Services only provide the delegate instance; no repeated type parameters.
 */
export abstract class PrismaCrudService<Model> {
  protected constructor(protected readonly delegate: DelegateWithId<Model>) {}

  async findById(id: string, options?: { select?: any; include?: any }) {
    const { select, include } = options || {};
    return this.delegate.findUnique({ where: { id }, select, include });
  }

  async findByIdOrThrow(
    id: string,
    resourceName = 'Record',
    options?: { select?: any; include?: any },
  ) {
    const result = await this.findById(id, options);
    if (!result) {
      throw new NotFoundException(`${resourceName} with id ${id} not found`);
    }
    return result;
  }

  async findMany(args?: any) {
    return args ? this.delegate.findMany(args) : this.delegate.findMany();
  }

  async create<T extends { data: any; select?: any; include?: any }>(args: T) {
    return this.delegate.create(args);
  }

  async update<
    T extends { where: { id: string }; data: any; select?: any; include?: any },
  >(args: T) {
    return this.delegate.update(args);
  }

  async delete(id: string) {
    return this.delegate.delete({ where: { id } });
  }
}
