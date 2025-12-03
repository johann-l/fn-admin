"use client";

import * as React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppData } from "@/context/app-data-context";
import type { Announcement } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Megaphone,
  Briefcase,
  Wrench,
  Calendar,
  FileText,
  User,
  PlusCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { supabase } from "@/lib/supabaseClient";

const BUCKET = "announcement-images";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const announcementFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["General", "Maintenance", "Event", "Policy Update"]),
  image: z
    .custom<FileList>()
    .refine(
      (files) =>
        files === undefined ||
        files.length === 0 ||
        files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) =>
        files === undefined ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
    .optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export default function AnnouncementList() {
  const { announcements, setAnnouncements } = useAppData();
  const [filter, setFilter] = React.useState<string>("all");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
    },
  });

  const fileRef = form.register("image");

  const fetchAnnouncements = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching announcements:", error);
        throw error;
      }

      const rows = (data ?? []).map((r: any) => ({
        ...r,
        created_at: new Date(r.created_at),
        images: r.images ?? [],
      })) as Announcement[];

      setAnnouncements(rows);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [setAnnouncements]);

  React.useEffect(() => {
    fetchAnnouncements();

    const channel = supabase
      .channel("public:announcements")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        (payload) => {
          const ev =
            (payload as any).eventType?.toUpperCase?.() ||
            (payload.event as string)?.toUpperCase?.();

          if (ev === "INSERT") {
            const newRow = {
              ...payload.new,
              created_at: new Date(payload.new.created_at),
            } as Announcement;

            setAnnouncements((prev) => {
              if (prev.some((a) => a.id === newRow.id)) return prev;
              return [newRow, ...prev];
            });
          } else if (ev === "UPDATE") {
            const updated = {
              ...payload.new,
              created_at: new Date(payload.new.created_at),
            } as Announcement;

            setAnnouncements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          } else if (ev === "DELETE") {
            const old = payload.old;
            setAnnouncements((prev) => prev.filter((a) => a.id !== old.id));
          } else {
            fetchAnnouncements();
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchAnnouncements, setAnnouncements]);

  const uploadImageToStorage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const filename = `announcements/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    return data.publicUrl;
  };

  const onSubmit = async (values: AnnouncementFormValues) => {
    setLoading(true);
    try {
      const { image, ...rest } = values;

      let imageUrls: string[] = [];

      if (image && image.length > 0) {
        const file = image[0];
        const url = await uploadImageToStorage(file);
        imageUrls = [url];
      }

      const newAnnouncement = {
        author: "Transport Dept.",
        images: imageUrls || [],
        ...rest,
      };

      const { data, error } = await supabase
        .from("announcements")
        .insert(newAnnouncement)
        .select()
        .single();

      if (error) throw error;

      form.reset();
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error creating announcement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  const filteredAnnouncements = (announcements ?? [])
    .filter((a) => (filter === "all" ? true : a.category === filter))
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const getCategoryIcon = (category: Announcement["category"]) => {
    switch (category) {
      case "General":
        return <Briefcase className="h-5 w-5" />;
      case "Maintenance":
        return <Wrench className="h-5 w-5" />;
      case "Event":
        return <Calendar className="h-5 w-5" />;
      case "Policy Update":
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: Announcement["category"]) => {
    switch (category) {
      case "General":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Maintenance":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Event":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Policy Update":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Announcements</CardTitle>
            <CardDescription>
              Stay up-to-date with the latest news and updates.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Policy Update">Policy Update</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Post
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && <div className="px-4 text-sm">Loading…</div>}

      {filteredAnnouncements.length > 0 ? (
        <div className="grid gap-6">
          {filteredAnnouncements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden p-3 sm:p-4">
                {announcement.images?.length > 0 && (
                  <Carousel className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                      {announcement.images.map((src, i) => (
                        <CarouselItem key={i}>
                          <div className="aspect-[16/7] relative">
                            <Image
                              src={src}
                              alt={`${announcement.title} image ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>

                    {announcement.images.length > 1 && (
                      <>
                        <CarouselPrevious className="absolute left-4" />
                        <CarouselNext className="absolute right-4" />
                      </>
                    )}
                  </Carousel>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription>
                        Posted on {format(announcement.created_at, "PPP")}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-2 ${getCategoryColor(
                          announcement.category
                        )}`}
                      >
                        {getCategoryIcon(announcement.category)}
                        {announcement.category}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {announcement.content}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
                  <User className="h-4 w-4" />
                  <span>Posted by {announcement.author}</span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone className="h-12 w-12 mx-auto" />
          <p className="mt-4 font-medium">No announcements found</p>
          <p className="text-sm">
            There are no announcements for the selected category.
          </p>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post a New Announcement</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Holiday Service Schedule"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Event">Event</SelectItem>
                        <SelectItem value="Policy Update">
                          Policy Update
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write the announcement details here..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Image (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Post Announcement</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
