import { Suspense } from "react";
import { Calendar, CheckCircle2, Clock, Users } from "lucide-react";
import {
  getTodaysPosts,
  getUpcomingPosts,
  getDashboardStats,
} from "@/app/actions/posts";
import { StatsCard } from "@/components/stats-card";
import { PostList } from "@/components/post-list";
import { getAllAccountSets } from "@/app/actions/account-sets";
import { CreateAccountSetDialog } from "@/components/create-account-set-dialog";
import { CreatePostDialog } from "@/components/create-post";
import { AccountSetOverview } from "@/components/account-set-overview";

function Loading() {
  return <div className="p-8 text-gray-500">Loading your posts...</div>;
}

async function DashboardContent() {
  // Fetch all data in parallel
  const [stats, todaysPosts, upcomingPosts, accountSets] = await Promise.all([
    getDashboardStats(),
    getTodaysPosts(),
    getUpcomingPosts(10),
    getAllAccountSets(),
  ]);

  return (
    <div className="p-6">
      {/* Header with Account Set Creation */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Content Dashboard</h1>
          <p className="text-gray-600">
            Track and manage your cross-platform posts
          </p>
        </div>
        <div className="flex gap-4">
          <CreatePostDialog />
          <CreateAccountSetDialog />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Account Sets"
          value={accountSets.length}
          icon={Users}
          description="Total content channel sets"
        />
        <StatsCard
          title="Today's Posts"
          value={todaysPosts.length}
          icon={Calendar}
          description={`${stats.pendingTodayCount} pending`}
        />
        <StatsCard
          title="Upcoming"
          value={stats.scheduledPosts}
          icon={Clock}
          description="Next 7 days"
        />
        <StatsCard
          title="Upload Progress"
          value={stats.completionRate}
          icon={CheckCircle2}
          description={`${stats.completedToday}/${stats.totalTodayPosts} today`}
          format="percent"
        />
      </div>

      {/* Account Sets Overview */}
      <AccountSetOverview accountSets={accountSets} />

      {/* Today's Posts */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-medium">Today&apos;s Posts</h2>
        <PostList
          posts={todaysPosts}
          emptyMessage="No posts scheduled for today"
        />
      </div>

      {/* Upcoming Posts */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-medium">Next Up</h2>
        <PostList
          posts={upcomingPosts}
          emptyMessage="No upcoming posts scheduled"
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  );
}
