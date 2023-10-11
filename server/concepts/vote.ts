import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface VoteDoc extends BaseDoc {
  post: ObjectId;
  voteCount: number;
  upvotedMembers: ObjectId[];
  downvotedMembers: ObjectId[];
}

export default class VoteConcept {
  public readonly voteCounts = new DocCollection<VoteDoc>("voteCounts");

  async initializePostVotes(post: ObjectId) {
    const _id = await this.voteCounts.createOne({ post, voteCount: 0, upvotedMembers: [], downvotedMembers: [] });
    return { msg: "Post votes initialized successfully!", voteCount: await this.voteCounts.readOne({ _id }) };
  }

  async getPostRating(post: ObjectId) {
    const voteCount = await this.voteCounts.readOne({ post: new ObjectId(post) });
    if (voteCount === null) {
      throw new NotFoundError(`Post not found!`);
    }
    return voteCount;
  }

  async userAlreadyUpvoted(post: ObjectId, user: ObjectId) {
    const voteCount = await this.voteCounts.readOne({ post: new ObjectId(post) });
    if (voteCount === null) {
      throw new NotFoundError(`Post not found!`);
    }
    let found = false;
    for (const member of voteCount.upvotedMembers) {
      if (member.equals(new ObjectId(user))) found = true;
    }
    return found;
  }

  async userAlreadyDownvoted(post: ObjectId, user: ObjectId) {
    const voteCount = await this.voteCounts.readOne({ post: new ObjectId(post) });
    if (voteCount === null) {
      throw new NotFoundError(`Post not found!`);
    }
    let found = false;
    for (const member of voteCount.downvotedMembers) {
      if (member.equals(new ObjectId(user))) found = true;
    }
    return found;
  }

  async upvotePost(post: ObjectId, user: ObjectId) {
    const voteCount = await this.getPostRating(post);
    if (await this.userAlreadyUpvoted(post, user)) {
      throw new NotAllowedError("Cannot upvote same post twice");
    } else if (await this.userAlreadyDownvoted(post, user)) {
      await this.voteCounts.updateOne(
        { post: new ObjectId(post) },
        {
          voteCount: voteCount.voteCount + 1,
          upvotedMembers: voteCount.upvotedMembers.concat([user]),
          downvotedMembers: voteCount.downvotedMembers.filter((member) => !member.equals(new ObjectId(user))),
        },
      );
    } else await this.voteCounts.updateOne({ post: new ObjectId(post) }, { voteCount: voteCount.voteCount + 1, upvotedMembers: voteCount.upvotedMembers.concat([user]) });
    return { msg: "Post successfully updated!" };
  }

  async downvotePost(post: ObjectId, user: ObjectId) {
    const voteCount = await this.getPostRating(post);
    if (await this.userAlreadyDownvoted(post, user)) {
      throw new NotAllowedError("Cannot downvote same post twice");
    } else if (await this.userAlreadyUpvoted(post, user)) {
      await this.voteCounts.updateOne(
        { post: new ObjectId(post) },
        {
          voteCount: voteCount.voteCount - 1,
          downvotedMembers: voteCount.downvotedMembers.concat([user]),
          upvotedMembers: voteCount.upvotedMembers.filter((member) => !member.equals(new ObjectId(user))),
        },
      );
    } else await this.voteCounts.updateOne({ post: new ObjectId(post) }, { voteCount: voteCount.voteCount + 1, upvotedMembers: voteCount.upvotedMembers.concat([user]) });
    return { msg: "Post successfully updated!" };
  }
}
