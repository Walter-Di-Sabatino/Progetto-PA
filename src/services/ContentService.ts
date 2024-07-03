import { IRepository } from '../repositories/IRepository';
import Content from '../models/Content';

export class ContentService {
  private contentRepository: IRepository<Content>;

  constructor(contentRepository: IRepository<Content>) {
    this.contentRepository = contentRepository;
  }

  async getAllContents(): Promise<Content[]> {
    return this.contentRepository.findAll();
  }

  async getContentById(id: number): Promise<Content | null> {
    return this.contentRepository.findById(id);
  }

  async createContent(content: Partial<Content>): Promise<Content> {
    return this.contentRepository.create(content);
  }

  async updateContent(id: number, content: Partial<Content>): Promise<Content | null> {
    return this.contentRepository.update(id, content);
  }

  async deleteContent(id: number): Promise<boolean> {
    return this.contentRepository.delete(id);
  }
}
