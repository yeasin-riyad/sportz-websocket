import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import { db } from "../db/db.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();
matchRouter.get("/", async(req, res) => {
    const parsed=listMatchesQuerySchema.safeParse(req.query);
    if(!parsed.success){
        return res.status(400).json({ message: "Invalid query parameters", details:JSON.stringify(parsed.error) });
    }
    const limit=Math.min(parsed.data.limit ?? 50, 100);
    // Here you would typically fetch matches from your database with pagination
    try {
        const matchesList=await db.select().from(matches).orderBy((desc(matches.createdAt))).limit(limit);
        res.status(200).json({data: matchesList });
    } catch (error) {
        console.error("Failed to fetch matches", error);
        res.status(500).json({ message: "Failed to fetch matches" });
    }
});

matchRouter.post("/", async (req, res) => {
    const parsed=createMatchSchema.safeParse(req.body);

    if(!parsed.success){
        return res.status(400).json({ message: "Invalid match data", details:JSON.stringify(parsed.error) });

    }
 const { startTime, endTime, homeScore, awayScore } = parsed.data;

    try {
        // Here you would typically insert the new match into your database
        const [event]=await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
            status:getMatchStatus(startTime, endTime),
        }).returning();

        if(req.app.locals.broadcastMatchCreated){
            req.app.locals.broadcastMatchCreated(event);
        }
        // For demonstration, we'll just return the parsed data
        res.status(201).json({ message: "Match created successfully", data: event });    
        
    } catch (error) {
        console.error("Failed to create match", error);
        res.status(500).json({ message: "Failed to create match" });
        
    }
});