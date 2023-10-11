import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface CompilationDoc extends BaseDoc {
  owner: ObjectId;
  name: string;
  content: ObjectId[];
}

export default class CompilationConcent {
  public readonly compilations = new DocCollection<CompilationDoc>("compilations");

  async create(owner: ObjectId, name: string) {
    await this.canCreate(owner, name);
    const _id = await this.compilations.createOne({ owner, name, content: [] });
    return { msg: "Compilation created successfully!", compilation: await this.compilations.readOne({ _id }) };
  }

  async getCompilationById(_id: ObjectId) {
    const compilation = await this.compilations.readOne({ _id });
    if (compilation === null) {
      throw new NotFoundError(`Compilation not found!`);
    }
    return compilation;
  }

  async getOwnerCompilations(owner: string) {
    return await this.compilations.readMany({ owner: new ObjectId(owner) });
  }

  async getCompilationByName(owner: ObjectId, name: string) {
    const compilation = await this.compilations.readOne({ owner: new ObjectId(owner), name });
    if (compilation === null) {
      throw new NotFoundError(`Compilation not found!`);
    }
    return compilation;
  }

  async getCompilationContents(compilationId: ObjectId) {
    const compilation = this.getCompilationById(compilationId);
    return (await compilation).content;
  }

  async addContent(compilationId: ObjectId, contentId: ObjectId) {
    const compilation = this.getCompilationById(compilationId);
    await this.compilations.updateOne({ _id: compilationId }, { content: (await compilation).content.concat([contentId]) });
    return { msg: `Successfully added content for compilation` };
  }

  async contentInCompilation(compilationId: ObjectId, contentId: ObjectId) {
    const compilation = this.getCompilationById(compilationId);
    let found = false;
    for (const id of (await compilation).content) {
      found = found || id == contentId;
    }

    return found;
  }

  async removeContent(compilationId: ObjectId, contentId: ObjectId) {
    const compilation = await this.getCompilationById(compilationId);
    if (!(await this.contentInCompilation(compilationId, contentId))) {
      throw new NotAllowedError("Content not found in compilation");
    }

    await this.compilations.updateOne({ _id: compilationId }, { content: compilation.content.filter((id) => id != contentId) });
    return { msg: `Successfully removed content from compilation` };
  }

  async reorderContent(compilationId: ObjectId, compare: (a: ObjectId, b: ObjectId) => number) {
    const compilation = await this.getCompilationById(compilationId);

    await this.compilations.updateOne({ _id: compilationId }, { content: compilation.content.sort(compare) });
    return { msg: `Successfully ordered compilation content` };
  }

  async deleteCompilation(_id: ObjectId) {
    await this.compilations.deleteOne({ _id });
    return { msg: "compilation deleted!" };
  }

  async compilationExists(_id: ObjectId) {
    const maybecompilation = await this.compilations.readOne({ _id });
    if (maybecompilation === null) {
      throw new NotFoundError(`compilation not found!`);
    }
  }

  private async canCreate(owner: ObjectId, name: string) {
    if (!name) {
      throw new BadValuesError("compilation name must be non-empty!");
    }
    if (!owner) {
      throw new BadValuesError("compilation must have owner");
    }
    await this.isCompilationUnique(owner, name);
  }

  private async isCompilationUnique(owner: ObjectId, name: string) {
    if (await this.compilations.readOne({ owner, name })) {
      throw new NotAllowedError(`Group with name ${name} already exists!`);
    }
  }
}
