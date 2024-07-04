import { ContentAttributes, ContentCreationAttributes } from '../../models/Content';

interface IContentDAO {
  create(content: ContentCreationAttributes): Promise<ContentAttributes>;
  findById(id: number): Promise<ContentAttributes | null>;
  update(id: number, updates: Partial<ContentAttributes>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}

export default IContentDAO;
