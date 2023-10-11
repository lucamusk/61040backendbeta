import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface VoteDoc extends BaseDoc {
  post: ObjectId;
  voteCount: number;
}

export default class VoteConcept {
  public readonly voteCounts = new DocCollection<VoteDoc>("voteCounts");

  async initializePostVotes(post: ObjectId) {
    const _id = await this.voteCounts.createOne({ post, voteCount: 0 });
    return { msg: "Post votes initialized successfully!", voteCount: await this.voteCounts.readOne({ _id }) };
  }

  async getPostRating(post: string) {
    const voteCount = await this.voteCounts.readOne({ post: new ObjectId(post) });
    if (voteCount === null) {
      throw new NotFoundError(`Post not found!`);
    }
    return voteCount;
  }

  async upvotePost(post: string) {
    const voteCount = await this.getPostRating(post);
    await this.voteCounts.updateOne({ post: new ObjectId(post) }, { voteCount: voteCount.voteCount + 1 });
    return { msg: "Post successfully updated!" };
  }

  async downvotePost(post: string) {
    const voteCount = await this.getPostRating(post);
    await this.voteCounts.updateOne({ post: new ObjectId(post) }, { voteCount: voteCount.voteCount - 1 });
    return { msg: "Post successfully updated!" };
  }
}
