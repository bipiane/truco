const R = require("ramda");
const mongoose = require("mongoose");
const { DataSource } = require("apollo-datasource");
const { pubsub, events } = require("../subscriptions");

const Match = mongoose.model("Match");

class MatchAPI extends DataSource {
  constructor() {
    super();
  }

  initialize(config) {
    this.context = config.context;
  }

  async getAllMatches() {
    const matches = await Match.find()
      .populate("creator")
      .populate("players");
    return matches.map(m => m.toObject());
  }

  async getMatchById({ matchId }) {
    const match = await Match.findById(matchId);
    return match;
  }

  async createMatch({ playersCount, points, userId }) {
    const newMatch = await new Match({
      playersCount,
      points,
      creator: userId,
      players: [userId]
    }).save();

    const newMatchData = (await newMatch
      .populate("creator")
      .populate("players")
      .execPopulate()).toObject();

    pubsub.publish(events.MATCH_ADDED, { matchAdded: newMatchData });
    return newMatchData;
  }

  async joinMatch({ matchId, userId }) {
    const match = await Match.findById(matchId);

    if (!match) {
      throw new Error(`There is no match with the id ${matchId}`);
    }

    if (match.players.length >= match.playersCount) {
      throw new Error("The match is already full");
    }

    if (match.creator === userId) {
      throw new Error("Can't join your own match");
    }

    if (match.players.includes(userId)) {
      throw new Error("You already joined this match");
    }

    const updatedMatch = await Match.findByIdAndUpdate(matchId, {
      $push: { players: userId }
    })
      .populate("creator")
      .populate("players");

    return updatedMatch.toObject();
  }
}

module.exports = MatchAPI;
