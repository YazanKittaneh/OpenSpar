/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as cleanup from "../cleanup.js";
import type * as cron from "../cron.js";
import type * as debateEngine from "../debateEngine.js";
import type * as debates from "../debates.js";
import type * as events from "../events.js";
import type * as subscriptions from "../subscriptions.js";
import type * as turns from "../turns.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  cleanup: typeof cleanup;
  cron: typeof cron;
  debateEngine: typeof debateEngine;
  debates: typeof debates;
  events: typeof events;
  subscriptions: typeof subscriptions;
  turns: typeof turns;
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
