/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as db_agents from "../db/agents.js";
import type * as db_consents from "../db/consents.js";
import type * as db_conversations from "../db/conversations.js";
import type * as db_messages from "../db/messages.js";
import type * as db_participants from "../db/participants.js";
import type * as db_survey from "../db/survey.js";
import type * as db_topics from "../db/topics.js";
import type * as types_convexTypes from "../types/convexTypes.js";
import type * as types_participantTypes from "../types/participantTypes.js";
import type * as types_surveyTypes from "../types/surveyTypes.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "db/agents": typeof db_agents;
  "db/consents": typeof db_consents;
  "db/conversations": typeof db_conversations;
  "db/messages": typeof db_messages;
  "db/participants": typeof db_participants;
  "db/survey": typeof db_survey;
  "db/topics": typeof db_topics;
  "types/convexTypes": typeof types_convexTypes;
  "types/participantTypes": typeof types_participantTypes;
  "types/surveyTypes": typeof types_surveyTypes;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
