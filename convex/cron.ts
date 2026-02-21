import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly("cleanup old debates", { minuteUTC: 0 }, internal.cleanup.cleanupOldDebates, {});

export default crons;
