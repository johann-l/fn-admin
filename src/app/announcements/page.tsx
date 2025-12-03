import Header from "@/components/layout/header";
import AnnouncementList from "@/components/announcements/announcement-list";

export default function AnnouncementsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <Header title="Announcements" />
      <main className="flex-1 p-4 md:p-6">
        <AnnouncementList />
      </main>
    </div>
  );
}
