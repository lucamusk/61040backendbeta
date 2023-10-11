import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface MusicDoc extends BaseDoc {
  audioLink: string;
  artist: string;
  name: string;
  duration: number;
}

export default class MusicConcept {
  public readonly music = new DocCollection<MusicDoc>("music");

  async addMusic(audioLink: string, artist: string, name: string, duration: number) {
    const _id = await this.music.createOne({ audioLink, artist, name, duration });
    return { msg: "Music added successfully!", music: await this.music.readOne({ _id }) };
  }

  async getAllMusic() {
    const music = await this.music.readMany({});
    return music;
  }

  async getSong(_id: ObjectId) {
    const song = await this.music.readOne({ _id });
    if (song === null) {
      throw new NotFoundError(`Music not found!`);
    }
    return song;
  }

  async getSongsByArtist(artist: string) {
    const songs = await this.music.readMany({ artist });
    return songs;
  }

  async getSongsByName(name: string) {
    const songs = await this.music.readMany({ name });
    return songs;
  }
}
