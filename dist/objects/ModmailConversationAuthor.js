"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RedditContent_1 = require("./RedditContent");
/**
 * A class representing an author from a modmail conversation
 * <style> #ModmailConversationAuthor {display: none} </style>
 * @example
 *
 * // Get a Modmail Conversation author with a given ID
 * r.getNewModmailConversation('75hxt').getParticipant()
 * @extends RedditContent
 */
class ModmailConversationAuthor extends RedditContent_1.default {
    constructor(options, r, hasFetched) {
        super(options, r, hasFetched);
        options.recentComments = Object.keys(options.recentComments).map(commentId => this._r._newObject('Comment', Object.assign({ name: commentId }, options.recentComments[commentId])));
        options.recentPosts = Object.keys(options.recentPosts).map(postId => this._r._newObject('Submission', Object.assign({ name: postId }, options.recentPosts[postId])));
    }
    /**
     * @summary Gets information on a Reddit user for the given modmail.
     * @returns {RedditUser} An unfetched RedditUser object for the requested user
     * @example
     *
     * r.getNewModmailConversation('efy3lax').getParticipant().getUser()
     * // => RedditUser { name: 'not_an_aardvark' }
     * r.getNewModmailConversation('efy3lax').getParticipant().getUser().link_karma.then(console.log)
     * // => 6
     */
    getUser() {
        return this._r.getUser(this.name);
    }
}
exports.default = ModmailConversationAuthor;
;
