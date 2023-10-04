import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotFoundError } from "./errors";

export interface CaptionDoc extends BaseDoc {
  media: ObjectId;
  text: String;
}

export default class CaptionConcept {
  public readonly captions = new DocCollection<CaptionDoc>("captions");

  async create(media: ObjectId, text: String) {
    await this.canCreate(media);
    const _id = await this.captions.createOne({ media: media, text });
    return { msg: "Caption created successfully!", caption: await this.captions.readOne({ _id }) };
  }

  async getCaptionById(_id: ObjectId) {
    const caption = await this.captions.readOne({ _id });
    if (caption === null) {
      throw new NotFoundError(`Caption not found!`);
    }
    return caption;
  }

  async getCaptionsByMedia(media: ObjectId) {
    const captions = await this.captions.readMany({ media }, { sort: { dateUpdated: -1 } });
    return captions;
  }

  private async canCreate(media: ObjectId) {
    if (media === null) {
      throw new BadValuesError("Media must be non-null!");
    }
  }
}
