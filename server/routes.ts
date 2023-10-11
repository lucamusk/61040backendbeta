import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import assert from "assert";
import { Caption, Compilation, Friend, Group, Music, Photobanner, Post, User, Vote, WebSession } from "./app";
import { BadValuesError, NotAllowedError } from "./concepts/errors";
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
    const created = await User.create(username, password);
    if (created.user === undefined || created.user === null) {
      throw new NotAllowedError("Test");
    }
    await Compilation.create(created.user._id, "favorites");
    return created;
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
  async getPosts(group: ObjectId, author?: string) {
    let posts;
    assert(group, new BadValuesError("Please specify a group"));
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(new ObjectId(group), id);
    } else {
      posts = await Post.getPosts({ location: group });
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, music: ObjectId, text: string, group: ObjectId, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const captionResult = await Caption.create(music, text);
    if (!(await Group.userInGroup(group, user))) {
      throw new NotAllowedError("User not in group");
    }
    assert(captionResult.caption, "Failure to create caption");
    const created = await Post.create(user, captionResult.caption._id, group, options);
    await Vote.initializePostVotes(created.post!._id);
    await Compilation.addContent((await Compilation.getCompilationByName(group, "timeline"))._id, created.post!._id);
    await Compilation.addContent((await Compilation.getCompilationByName(group, "recents"))._id, created.post!._id);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId, group: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    await Compilation.removeContent((await Compilation.getCompilationByName(group, "timeline"))._id, _id);
    await Compilation.removeContent((await Compilation.getCompilationByName(group, "recents"))._id, _id);
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

  @Router.get("/group")
  async getAllGroups() {
    return Group.getAllGroups();
  }

  @Router.post("/group")
  async createGroup(session: WebSessionDoc, name: string) {
    const created = await Group.create(name);
    assert(created.group, "Something went wrong");
    await Compilation.create(created.group._id, "headline");
    await Compilation.create(created.group._id, "recents");
    await Compilation.create(created.group._id, "timeline");
    return { msg: created.msg, group: created.group.name };
  }

  @Router.put("/group/leave/:name")
  async leaveGroup(session: WebSessionDoc, name: string) {
    const group = Group.getGroupByName(name);
    const userId = WebSession.getUser(session);
    return await Group.removeMember(userId, (await group)._id);
  }

  @Router.put("/group/join/:name")
  async joinGroup(session: WebSessionDoc, name: string) {
    const group = Group.getGroupByName(name);
    const userId = WebSession.getUser(session);
    return await Group.registerMember(userId, (await group)._id);
  }

  @Router.get("/group/:name")
  async getGroup(session: WebSessionDoc, name: string) {
    const group = await Group.getGroupByName(name);
    return { ...group };
  }

  @Router.post("/caption")
  async createCaption(session: WebSessionDoc, music: ObjectId, text: string) {
    return Caption.create(music, text);
  }

  @Router.get("/caption/:_id")
  async getCaption(session: WebSessionDoc, _id: ObjectId) {
    return Caption.getCaptionById(_id);
  }

  @Router.get("/caption/media/:_id")
  async getMediaCaptions(session: WebSessionDoc, _id: ObjectId) {
    return Caption.getCaptionsByMedia(_id);
  }

  @Router.post("/compilation/personal")
  async initializeUserPlaylist(session: WebSessionDoc, name: string) {
    const userId = WebSession.getUser(session);
    return await Compilation.create(userId, name);
  }

  @Router.delete("/compilation/personal/")
  async deleteUserPlaylist(session: WebSessionDoc, name: string) {
    const userId = WebSession.getUser(session);
    const compilation = await Compilation.getCompilationByName(userId, name);
    return await Compilation.deleteCompilation(compilation._id);
  }

  @Router.put("/compilation/personal/add")
  async addUserPlaylistContent(session: WebSessionDoc, name: string, content: ObjectId) {
    const userId = WebSession.getUser(session);
    const compilation = await Compilation.getCompilationByName(userId, name);
    return await Compilation.addContent(compilation._id, content);
  }

  @Router.put("/compilation/personal/remove")
  async removeUserPlaylistContent(session: WebSessionDoc, name: string, content: ObjectId) {
    const userId = WebSession.getUser(session);
    const compilation = await Compilation.getCompilationByName(userId, name);
    return await Compilation.removeContent(compilation._id, content);
  }

  @Router.get("/compilation/personal/:name")
  async getPersonalPlaylistContent(session: WebSessionDoc, name: string) {
    const userId = WebSession.getUser(session);
    return await Compilation.getCompilationByName(userId, name);
  }

  @Router.post("/compilation/headline")
  async createHeadlinePlaylist(session: WebSessionDoc, group: ObjectId) {
    const userId = WebSession.getUser(session);
    assert(await Group.userInGroup(group, userId), new NotAllowedError("Not in the group"));
    return Compilation.create(group, "headline");
  }

  @Router.delete("/compilation/headline")
  async deleteHeadlinePlaylist(session: WebSessionDoc, group: ObjectId) {
    const userId = WebSession.getUser(session);
    assert(await Group.userInGroup(group, userId), new NotAllowedError("Not in the group"));
    const compilation = Compilation.getCompilationByName(group, "headline");
    return await Compilation.deleteCompilation((await compilation)._id);
  }

  @Router.put("/compilation/headline/add")
  async addHeadlinePlaylistContent(session: WebSessionDoc, group: ObjectId, content: ObjectId) {
    const userId = WebSession.getUser(session);
    assert(await Group.userInGroup(group, userId), new NotAllowedError("Not in the group"));
    const compilation = await Compilation.getCompilationByName(group, "headline");
    return await Compilation.addContent(compilation._id, content);
  }

  @Router.put("/compilation/headline/remove")
  async removeHeadlinePlaylistContent(session: WebSessionDoc, group: ObjectId, content: ObjectId) {
    const userId = WebSession.getUser(session);
    assert(await Group.userInGroup(group, userId), new NotAllowedError("Not in the group"));
    const compilation = await Compilation.getCompilationByName(group, "headline");
    return await Compilation.removeContent(compilation._id, content);
  }

  @Router.get("/compilation/headline/:group")
  async getHeadlinePlaylistContent(group: ObjectId) {
    return await Compilation.getCompilationByName(group, "headline");
  }

  @Router.get("/compilation/recents/:group")
  async getRecentsPlaylistContent(group: ObjectId) {
    return await Compilation.getCompilationByName(group, "recents");
  }

  @Router.post("/music")
  async addMusic(audioLink: string, artist: string, name: string, duration: number) {
    return await Music.addMusic(audioLink, artist, name, duration);
  }

  @Router.get("/music")
  async getAllMusic() {
    return await Music.getAllMusic();
  }

  @Router.get("/music/id/:_id")
  async getMusicById(_id: ObjectId) {
    return await Music.getSong(_id);
  }

  @Router.get("/music/artist/:artist")
  async getMusicByArtist(artist: string) {
    return await Music.getSongsByArtist(artist);
  }

  @Router.get("/music/name/:name")
  async getMusicByName(name: string) {
    return await Music.getSongsByName(name);
  }

  @Router.put("/vote/upvote/:_id")
  async upvotePost(session: WebSessionDoc, _id: ObjectId) {
    const userId = WebSession.getUser(session);
    return await Vote.upvotePost(_id, userId);
  }

  @Router.put("/vote/downvote/:_id")
  async downvotePost(session: WebSessionDoc, _id: ObjectId) {
    const userId = WebSession.getUser(session);
    return await Vote.downvotePost(_id, userId);
  }

  @Router.get("/vote/:_id")
  async getPostRating(post: ObjectId) {
    return await Vote.getPostRating(post);
  }

  @Router.post("/photobanner/:_id")
  async setPhotobanner(item: ObjectId, photoLink: string) {
    return await Photobanner.setPhoto(item, photoLink);
  }

  @Router.get("/photobanner/:_id")
  async getPhotobanner(item: ObjectId) {
    return await Photobanner.getItemPhotoBanner(item);
  }

  @Router.get("/compilation/timeline/:group")
  async getTimeline(group: ObjectId) {
    return await Compilation.getCompilationByName(group, "timeline");
  }

  @Router.get("/compilation/rated_timeline/:group")
  async getRatingSortedTimeline(group: ObjectId) {
    const content = await Compilation.getCompilationContents((await Compilation.getCompilationByName(group, "timeline"))._id);
    const postRatings = await Promise.all(content.map((_id) => Vote.getPostRating(_id)));
    const posts = (await Promise.all(content.map((_id) => Post.getPosts({ _id })))).flat();
    return posts.map((post, i) => [post, postRatings[i].voteCount] as [PostDoc, number]).sort((a: [PostDoc, number], b: [PostDoc, number]) => b[1] - a[1]);
  }

  @Router.get("/compilation/favorite")
  async getFavorites(session: WebSessionDoc) {
    const userId = WebSession.getUser(session);
    return await Compilation.getCompilationByName(userId, "favorites");
  }

  @Router.put("/compilation/add/favorite")
  async addFavorite(session: WebSessionDoc, content: ObjectId) {
    const userId = WebSession.getUser(session);
    const compilation = await Compilation.getCompilationByName(userId, "favorites");
    return await Compilation.addContent(compilation._id, content);
  }

  @Router.put("/compilation/remove/favorite")
  async removeFavorite(session: WebSessionDoc, content: ObjectId) {
    const userId = WebSession.getUser(session);
    const compilation = await Compilation.getCompilationByName(userId, "favorites");
    return await Compilation.removeContent(compilation._id, content);
  }
}
export default getExpressRouter(new Routes());
