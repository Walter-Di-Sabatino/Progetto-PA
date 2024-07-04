import { DatasetAttributes, DatasetCreationAttributes } from '../../models/dataset';

interface IDatasetDAO {
  create(dataset: DatasetCreationAttributes): Promise<DatasetAttributes>;
  findAll(): Promise<DatasetAttributes[]>;
  findById(id: number): Promise<DatasetAttributes | null>;
  update(id: number, updates: Partial<DatasetAttributes>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

export default IDatasetDAO;
