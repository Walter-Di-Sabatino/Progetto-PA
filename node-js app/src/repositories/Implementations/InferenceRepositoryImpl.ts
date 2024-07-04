import IInferenceDAO from '../../dao/Interfaces/IInferenceDAO';
import { InferenceAttributes, InferenceCreationAttributes } from '../../models/Inference';
import IInferenceRepository from '../Interfaces/IInferenceRepository';


class InferenceRepository implements IInferenceRepository {
  private inferenceDAO: IInferenceDAO;

  constructor(inferenceDAO: IInferenceDAO) {
    this.inferenceDAO = inferenceDAO;
  }

  async create(inference: InferenceCreationAttributes): Promise<InferenceAttributes> {
    return this.inferenceDAO.create(inference);
  }

  async findAll(): Promise<InferenceAttributes[]> {
    return this.inferenceDAO.findAll();
  }

  async findById(id: number): Promise<InferenceAttributes | null> {
    return this.inferenceDAO.findById(id);
  }

  async update(id: number, updates: Partial<InferenceAttributes>): Promise<boolean> {
    return this.inferenceDAO.update(id, updates);
  }

  async delete(id: number): Promise<boolean> {
    return this.inferenceDAO.delete(id);
  }
}

export default InferenceRepository;