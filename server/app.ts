import CaptionConcept from "./concepts/caption";
import FriendConcept from "./concepts/friend";
import GroupConcent from "./concepts/group";
import PostConcept from "./concepts/post";
import UserConcept from "./concepts/user";
import WebSessionConcept from "./concepts/websession";

// App Definition using concepts
export const WebSession = new WebSessionConcept();
export const User = new UserConcept();
export const Post = new PostConcept();
export const Friend = new FriendConcept();
export const Group = new GroupConcent();
export const Caption = new CaptionConcept();
