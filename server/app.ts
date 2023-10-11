import CaptionConcept from "./concepts/caption";
import CompilationConcent from "./concepts/compilation";
import FriendConcept from "./concepts/friend";
import GroupConcent from "./concepts/group";
import MusicConcept from "./concepts/music";
import PhotoBannerConcept from "./concepts/photobanner";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import VoteConcept from "./concepts/vote";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Group = new GroupConcent();
export const Caption = new CaptionConcept();
export const Compilation = new CompilationConcent();
export const Music = new MusicConcept();
export const Vote = new VoteConcept();
export const Photobanner = new PhotoBannerConcept();
