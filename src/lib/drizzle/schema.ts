import {
  pgTable,
  integer,
  varchar,
  timestamp,
  boolean,
  text,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Account Set (group of related social accounts)
export const AccountSetTable = pgTable("account_set", {
  id: serial().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Individual Social Media Account
export const AccountTable = pgTable("account", {
  id: serial().primaryKey(),
  accountSetId: integer("account_set_id")
    .notNull()
    .references(() => AccountSetTable.id),
  platform: varchar("platform", { length: 50 }).notNull(),
  accountName: varchar("account_name", { length: 100 }).notNull(),
  username: varchar("username", { length: 100 }).notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Video/Content to be posted
export const VideoTable = pgTable("video", {
  id: serial().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  duration: varchar("duration", { length: 10 }),
  caption: text("caption"),
  thumbnailPath: varchar("thumbnail_path", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Post schedule for a video across account sets
export const PostTable = pgTable("post", {
  id: serial().primaryKey(),
  videoId: integer("video_id")
    .notNull()
    .references(() => VideoTable.id),
  accountSetId: integer("account_set_id")
    .notNull()
    .references(() => AccountSetTable.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Track posting status for each individual account
export const PostStatusTable = pgTable("post_status", {
  id: serial().primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => PostTable.id),
  accountId: integer("account_id")
    .notNull()
    .references(() => AccountTable.id),
  isPosted: boolean("is_posted").notNull().default(false),
  postedAt: timestamp("posted_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const accountSetRelations = relations(AccountSetTable, ({ many }) => ({
  accounts: many(AccountTable),
  posts: many(PostTable),
}));

export const accountRelations = relations(AccountTable, ({ one, many }) => ({
  accountSet: one(AccountSetTable, {
    fields: [AccountTable.accountSetId],
    references: [AccountSetTable.id],
  }),
  postStatuses: many(PostStatusTable),
}));

export const postRelations = relations(PostTable, ({ one, many }) => ({
  video: one(VideoTable, {
    fields: [PostTable.videoId],
    references: [VideoTable.id],
  }),
  accountSet: one(AccountSetTable, {
    fields: [PostTable.accountSetId],
    references: [AccountSetTable.id],
  }),
  postStatuses: many(PostStatusTable),
}));

export const postStatusRelations = relations(PostStatusTable, ({ one }) => ({
  post: one(PostTable, {
    fields: [PostStatusTable.postId],
    references: [PostTable.id],
  }),
  account: one(AccountTable, {
    fields: [PostStatusTable.accountId],
    references: [AccountTable.id],
  }),
}));

// Types
export type AccountSet = typeof AccountSetTable.$inferSelect;
export type NewAccountSet = typeof AccountSetTable.$inferInsert;

export type Account = typeof AccountTable.$inferSelect;
export type NewAccount = typeof AccountTable.$inferInsert;

export type Video = typeof VideoTable.$inferSelect;
export type NewVideo = typeof VideoTable.$inferInsert;

export type Post = typeof PostTable.$inferSelect;
export type NewPost = typeof PostTable.$inferInsert;

export type PostStatus = typeof PostStatusTable.$inferSelect;
export type NewPostStatus = typeof PostStatusTable.$inferInsert;
