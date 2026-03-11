/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as consents from "../consents.js";
import type * as conversations from "../conversations.js";
import type * as messages from "../messages.js";
import type * as survey from "../survey.js";
import type * as topics from "../topics.js";
import type * as types_convexTypes from "../types/convexTypes.js";
import type * as types_surveyTypes from "../types/surveyTypes.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  consents: typeof consents;
  conversations: typeof conversations;
  messages: typeof messages;
  survey: typeof survey;
  topics: typeof topics;
  "types/convexTypes": typeof types_convexTypes;
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
