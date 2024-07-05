import { DatasetAttributes, DatasetCreationAttributes } from '../../models/dataset';

interface IDatasetRepository {
  create(dataset: DatasetCreationAttributes): Promise<DatasetAttributes>;
  findAll(): Promise<DatasetAttributes[]>;
  findById(id: number): Promise<DatasetAttributes | null>;
  update(id: number, updates: Partial<DatasetAttributes>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  datasetWithSameName(name: string, userId: number ): Promise<DatasetAttributes[]>;
}

export default IDatasetRepository;