import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Caption, Friend, Group, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  @Router.post("/group")
  async createGroup(session: WebSessionDoc, name: string) {
    const created = await Group.create(name);
    return { msg: created.msg, group: created.group?.name };
  }
  @Router.put("/group/leave/:name")
  async leaveGroup(session: WebSessionDoc, name: string) {
    const group = Group.getGroupByName(name);
    const userId = WebSession.getUser(session);
    return await Group.removeMember(userId, await group);
  }

  @Router.put("/group/join/:name")
  async joinGroup(session: WebSessionDoc, name: string) {
    const group = Group.getGroupByName(name);
    console.log((await group)._id);
    const userId = WebSession.getUser(session);
    return await Group.registerMember(userId, await group);
  }

  @Router.get("/group/:name")
  async getGroup(session: WebSessionDoc, name: string) {
    const group = await Group.getGroupByName(name);
    return { ...group };
  }

  @Router.post("/caption")
  async createCaption(session: WebSessionDoc, media: ObjectId, name: string) {
    return Caption.create(media, name);
  }

  @Router.get("/caption/:_id")
  async getCaption(session: WebSessionDoc, _id: ObjectId) {
    return Caption.getCaptionById(_id);
  }

  @Router.get("/caption/media/:_id")
  async getMediaCaptions(session: WebSessionDoc, _id: ObjectId) {
    return Caption.getCaptionsByMedia(_id);
  }

  @Router.post("/post/:location")
  async postInLocation() {}

  @Router.post("/post/location")
  async addPostLocation() {}

  @Router.post("/music")
  async addMusic() {}

  @Router.get("/music/id/:_id")
  async getMusicById() {}

  @Router.get("/music/artist/:artist")
  async getMusicByArtist() {}

  @Router.get("/music/name/:name")
  async getMusicByName() {}

  @Router.put("/vote/upvote/:_id")
  async upvotePost() {}

  @Router.put("/vote/downvote/:_id")
  async downvotePost() {}

  @Router.get("/vote/rating/:_id")
  async getPostRating() {}

  @Router.post("/photobanner/:_id")
  async setPhotobanner() {}

  @Router.get("/photobanner/:_id")
  async getPhotobanner() {}

  @Router.post("/compilation/personal")
  async initializeUserPlaylist() {}

  @Router.post("/compilation/personal/delete/:_id")
  async deleteUserPlaylist() {}

  @Router.put("/compilation/personal/add")
  async addUserPlaylistContent() {}

  @Router.put("/compilation/personal/remove")
  async removeUserPlaylistContent() {}

  @Router.put("/compilation/personal/reorder")
  async reorderUserPlaylist() {}

  @Router.post("/compilation/headline")
  async initializeHeadlinePlaylist() {}

  @Router.post("/compilation/headline/delete")
  async deleteHeadlinePlaylist() {}

  @Router.put("/compilation/headline/add")
  async addHeadlinePlaylistContent() {}

  @Router.put("/compilation/headline/remove")
  async removeHeadlinePlaylistContent() {}

  @Router.put("/compilation/headline/reorder")
  async reorderHeadlinePlaylist() {}

  @Router.post("/compilation/recents")
  async initializeRecentsPlaylist() {}

  @Router.put("/compilation/recents/add")
  async addRecentsPlaylistContent() {}

  @Router.put("/compilation/recents/remove")
  async removeRecentsPlaylistContent() {}

  @Router.put("/compilation/recents/reorder")
  async reorderRecentsPlaylist() {}
}
export default getExpressRouter(new Routes());
