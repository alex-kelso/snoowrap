import RedditContent from './RedditContent';
import RedditUser from './RedditUser';
import * as Snoowrap from '../snoowrap';
export interface BanStatus {
    endDate?: string | null;
    reason: string;
    isBanned: boolean;
    isPermanent: boolean;
}
export interface RecentPost {
    date: string;
    permalink: string;
    title: string;
}
export interface RecentConvo {
    date: string;
    permalink: string;
    id: string;
    subject: string;
}
export interface RecentComment {
    date: string;
    permalink: string;
    title: string;
    comment: string;
}
/**
 * A class representing an author from a modmail conversation
 * <style> #ModmailConversationAuthor {display: none} </style>
 * @example
 *
 * // Get a Modmail Conversation author with a given ID
 * r.getNewModmailConversation('75hxt').getParticipant()
 * @extends RedditContent
 */
export default class ModmailConversationAuthor extends RedditContent<ModmailConversationAuthor> {
    name: string;
    isMod?: boolean;
    isAdmin?: boolean;
    isOp?: boolean;
    isParticipant?: boolean;
    isHidden?: boolean;
    isDeleted?: boolean;
    banStatus?: BanStatus;
    isSuspended?: boolean;
    isShadowBanned?: boolean;
    recentPosts?: {
        [id: string]: RecentPost;
    };
    recentConvos?: {
        [id: string]: RecentConvo;
    };
    recentComments?: {
        [id: string]: RecentComment;
    };
    constructor(options: any, r: Snoowrap, hasFetched: boolean);
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
    getUser(): Promise<RedditUser>;
}
