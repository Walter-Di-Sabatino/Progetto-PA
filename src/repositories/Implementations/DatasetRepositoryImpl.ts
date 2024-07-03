import { IRepository } from '../IRepository';
import Dataset from '../../models/Dataset';

export class DatasetRepositoryImpl implements IRepository<Dataset> {
  async findAll(): Promise<Dataset[]> {
    return Dataset.findAll();
  }

  async findById(id: number): Promise<Dataset | null> {
    return Dataset.findByPk(id);
  }

  async create(dataset: Partial<Dataset>): Promise<Dataset> {
    return Dataset.create(dataset as Dataset);
  }

  async update(id: number, dataset: Partial<Dataset>): Promise<Dataset | null> {
    const existingDataset = await Dataset.findByPk(id);
    if (!existingDataset) {
      return null;
    }
    return existingDataset.update(dataset);
  }

  async delete(id: number): Promise<boolean> {
    const result = await Dataset.destroy({ where: { id } });
    return result > 0;
  }
}