// app/(authenticated)/profile/page.tsx

"use client";

import UserProfile from "./UserProfile";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pt-4">
      <UserProfile />;
    </div>
  );
}
