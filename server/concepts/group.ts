import { ObjectId } from "mongodb";
import { User } from "../app";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
  name: string;
  members: ObjectId[];
}

export default class GroupConcent {
  public readonly groups = new DocCollection<GroupDoc>("groups");

  async create(name: string) {
    await this.canCreate(name);
    const _id = await this.groups.createOne({ name, members: [] });
    return { msg: "Group created successfully!", group: await this.groups.readOne({ _id }) };
  }

  async getAllGroups() {
    const groups = await this.groups.readMany({});
    return groups;
  }

  async getGroupById(_id: ObjectId) {
    const group = await this.groups.readOne({ _id: new ObjectId(_id) });
    if (group === null) {
      throw new NotFoundError(`Group not found!`);
    }
    return group;
  }

  async getGroupByName(name: string) {
    const group = await this.groups.readOne({ name });
    if (group === null) {
      throw new NotFoundError(`Group not found!`);
    }
    return group;
  }

  async getMemberUsers(name: string) {
    const group = this.getGroupByName(name);
    const users = (await group).members.map((id) => User.getUserById(id));
    return users;
  }

  async userInGroup(groupId: ObjectId, userId: ObjectId) {
    const group = await this.getGroupById(groupId);
    const groupUsers = group.members;
    let inGroup = false;

    for (const member of groupUsers) {
      if (member.equals(userId)) {
        inGroup = true;
        break;
      }
    }

    return inGroup;
  }

  async registerMember(userId: ObjectId, groupId: ObjectId) {
    const group = await this.getGroupById(groupId);
    if (await this.userInGroup(userId, groupId)) {
      throw new NotAllowedError("User already registered in group");
    }
    await this.groups.updateOne({ _id: groupId }, { members: group.members.concat([userId]) });
    return { msg: `Successfully registered user for ${group.name}` };
  }

  async removeMember(user: ObjectId, groupId: ObjectId) {
    const group = await this.getGroupById(groupId);
    if (!(await this.userInGroup(user, groupId))) {
      throw new NotAllowedError("User not registered in group");
    }

    await this.groups.updateOne({ _id: groupId }, { members: group.members.filter((member) => !member.equals(user)) });
    return { msg: `Successfully removed user from ${group.name}` };
  }

  async deleteGroup(_id: ObjectId) {
    await this.groups.deleteOne({ _id });
    return { msg: "Group deleted!" };
  }

  async groupExists(_id: ObjectId) {
    const maybeGroup = await this.groups.readOne({ _id });
    if (maybeGroup === null) {
      throw new NotFoundError(`Group not found!`);
    }
  }

  private async canCreate(name: string) {
    if (!name) {
      throw new BadValuesError("Group name must be non-empty!");
    }
    await this.isGroupNameUnique(name);
  }

  private async isGroupNameUnique(name: string) {
    if (await this.groups.readOne({ name })) {
      throw new NotAllowedError(`Group with name ${name} already exists!`);
    }
  }
}
