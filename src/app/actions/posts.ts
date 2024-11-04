"use server";

import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle/db";
import {
  PostTable,
  PostStatusTable,
  VideoTable,
  AccountTable,
  AccountSetTable,
} from "@/lib/drizzle/schema";

// Types for joined data
export type PostWithRelations = {
  id: number;
  videoId: number;
  accountSetId: number;
  scheduledDate: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  video: {
    id: number;
    title: string;
    filePath: string;
    duration: string | null;
    caption: string | null;
    thumbnailPath: string | null;
  } | null;
  accountSet: {
    id: number;
    name: string;
  };
  statuses: Array<{
    id: number;
    isPosted: boolean;
    postedAt: Date | null;
    account: {
      id: number;
      platform: string;
      accountName: string;
      accountSetId: number;
    };
  }>;
};

// Create a new post for an account set
export async function createPost(data: {
  videoId: number;
  accountSetId: number;
  scheduledDate: Date;
  notes?: string;
}): Promise<PostWithRelations> {
  const post = await db.transaction(async (tx) => {
    // Create the main post
    const [post] = await tx
      .insert(PostTable)
      .values({
        videoId: data.videoId,
        accountSetId: data.accountSetId,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      })
      .returning();

    // Get all accounts in the set
    const accounts = await tx
      .select()
      .from(AccountTable)
      .where(eq(AccountTable.accountSetId, data.accountSetId));

    // Create status entries for each account
    await tx
      .insert(PostStatusTable)
      .values(
        accounts.map((account) => ({
          postId: post.id,
          accountId: account.id,
          isPosted: false,
        }))
      )
      .returning();

    return post;
  });

  // Return full post with relations
  return getPostById(post.id);
}

// Get a single post with all its relations
export async function getPostById(id: number): Promise<PostWithRelations> {
  const result = await db
    .select({
      post: PostTable,
      video: VideoTable,
      accountSet: AccountSetTable,
      status: PostStatusTable,
      account: AccountTable,
    })
    .from(PostTable)
    .leftJoin(VideoTable, eq(VideoTable.id, PostTable.videoId))
    .leftJoin(AccountSetTable, eq(AccountSetTable.id, PostTable.accountSetId))
    .leftJoin(PostStatusTable, eq(PostStatusTable.postId, PostTable.id))
    .leftJoin(AccountTable, eq(AccountTable.id, PostStatusTable.accountId))
    .where(eq(PostTable.id, id));

  // Transform the result into our expected type
  const firstRow = result[0];
  if (!firstRow) throw new Error("Post not found");
  if (!firstRow.accountSet) throw new Error("Account set is missing");

  return {
    ...firstRow.post,
    video: firstRow.video,
    accountSet: firstRow.accountSet,
    statuses: result.map((row) => {
      if (!row.status || !row.account) throw new Error("Invalid post status");
      return {
        ...row.status,
        account: row.account,
      };
    }),
  };
}

// Get today's posts with full relations
export async function getTodaysPosts(): Promise<PostWithRelations[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await getPostsByDateRange(today, tomorrow);
}

// Get upcoming posts with full relations
export async function getUpcomingPosts(
  limit = 10
): Promise<PostWithRelations[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const posts = await db
    .select({
      post: PostTable,
      video: VideoTable,
      accountSet: AccountSetTable,
      status: PostStatusTable,
      account: AccountTable,
    })
    .from(PostTable)
    .leftJoin(VideoTable, eq(VideoTable.id, PostTable.videoId))
    .leftJoin(AccountSetTable, eq(AccountSetTable.id, PostTable.accountSetId))
    .leftJoin(PostStatusTable, eq(PostStatusTable.postId, PostTable.id))
    .leftJoin(AccountTable, eq(AccountTable.id, PostStatusTable.accountId))
    .where(gte(PostTable.scheduledDate, today))
    .orderBy(asc(PostTable.scheduledDate))
    .limit(limit);

  // Group by post ID to handle multiple statuses
  return groupPostResults(posts);
}

// Get posts by date range
export async function getPostsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PostWithRelations[]> {
  const posts = await db
    .select({
      post: PostTable,
      video: VideoTable,
      accountSet: AccountSetTable,
      status: PostStatusTable,
      account: AccountTable,
    })
    .from(PostTable)
    .leftJoin(VideoTable, eq(VideoTable.id, PostTable.videoId))
    .leftJoin(AccountSetTable, eq(AccountSetTable.id, PostTable.accountSetId))
    .leftJoin(PostStatusTable, eq(PostStatusTable.postId, PostTable.id))
    .leftJoin(AccountTable, eq(AccountTable.id, PostStatusTable.accountId))
    .where(
      and(
        gte(PostTable.scheduledDate, startDate),
        lt(PostTable.scheduledDate, endDate)
      )
    )
    .orderBy(asc(PostTable.scheduledDate));

  return groupPostResults(posts);
}

// Mark a specific account's post as posted
export async function markPosted(
  postId: number,
  accountId: number
): Promise<void> {
  await db
    .update(PostStatusTable)
    .set({
      isPosted: true,
      postedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(PostStatusTable.postId, postId),
        eq(PostStatusTable.accountId, accountId)
      )
    );
}

// Mark a specific account's post as not posted
export async function markNotPosted(
  postId: number,
  accountId: number
): Promise<void> {
  await db
    .update(PostStatusTable)
    .set({
      isPosted: false,
      postedAt: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(PostStatusTable.postId, postId),
        eq(PostStatusTable.accountId, accountId)
      )
    );
}

export async function toggleIsPosted(
  postId: number,
  accountId: number
): Promise<void> {
  const [status] = await db
    .select()
    .from(PostStatusTable)
    .where(
      and(
        eq(PostStatusTable.postId, postId),
        eq(PostStatusTable.accountId, accountId)
      )
    );

  if (status.isPosted) {
    await markNotPosted(postId, accountId);
  } else {
    await markPosted(postId, accountId);
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekLater = new Date(today);
  weekLater.setDate(weekLater.getDate() + 7);

  // Convert dates to ISO strings for the SQL query
  const todayStr = today.toISOString();
  const tomorrowStr = tomorrow.toISOString();
  const weekLaterStr = weekLater.toISOString();

  const stats = await db
    .select({
      totalPosts: sql<number>`count(distinct ${PostTable.id})`,
      scheduledPosts: sql<number>`count(distinct case when ${PostTable.scheduledDate} > ${tomorrowStr} and ${PostTable.scheduledDate} <= ${weekLaterStr} then ${PostTable.id} end)`,
      totalTodayPosts: sql<number>`count(distinct case when ${PostTable.scheduledDate} >= ${todayStr} and ${PostTable.scheduledDate} < ${tomorrowStr} then ${PostTable.id} end)`,
      completedToday: sql<number>`count(distinct case when ${PostTable.scheduledDate} >= ${todayStr} and ${PostTable.scheduledDate} < ${tomorrowStr} and ${PostStatusTable.isPosted} = true then ${PostTable.id} end)`,
    })
    .from(PostTable)
    .leftJoin(PostStatusTable, eq(PostStatusTable.postId, PostTable.id));

  const { totalPosts, scheduledPosts, totalTodayPosts, completedToday } =
    stats[0];

  return {
    totalPosts,
    scheduledPosts,
    totalTodayPosts,
    completedToday,
    completionRate:
      totalTodayPosts > 0
        ? Math.round((completedToday / totalTodayPosts) * 100)
        : 0,
    pendingTodayCount: totalTodayPosts - completedToday,
  };
}

// Update post details
export async function updatePost(
  id: number,
  data: Partial<{
    scheduledDate: Date;
    notes: string;
  }>
): Promise<PostWithRelations> {
  await db
    .update(PostTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(PostTable.id, id));

  return await getPostById(id);
}

// Delete a post and its statuses
export async function deletePost(id: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(PostStatusTable).where(eq(PostStatusTable.postId, id));

    await tx.delete(PostTable).where(eq(PostTable.id, id));
  });
}

// Helper function to group post results
function groupPostResults(results: any): PostWithRelations[] {
  const postsMap = new Map<number, PostWithRelations>();

  for (const row of results) {
    if (!postsMap.has(row.post.id)) {
      postsMap.set(row.post.id, {
        ...row.post,
        video: row.video,
        accountSet: row.accountSet,
        statuses: [],
      });
    }

    if (row.status && row.account) {
      const post = postsMap.get(row.post.id)!;
      post.statuses.push({
        ...row.status,
        account: row.account,
      });
    }
  }

  return Array.from(postsMap.values());
}
