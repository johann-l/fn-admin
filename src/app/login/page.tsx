"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Try Supabase Auth login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("Login failed: no user returned.");
        setLoading(false);
        return;
      }

      // 2️⃣ Save to localStorage
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_email", email);

      // 3️⃣ Ensure user exists in `users` table
      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking user:", selectError);
      }

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: user.id, // use Supabase Auth ID as primary key
            email,
            name: email.split("@")[0],
          },
        ]);

        if (insertError) {
          console.error("Error creating user:", insertError);
        } else {
          console.log("✅ User created in database");
        }
      } else {
        console.log("✅ Existing user found");
      }

      // 4️⃣ Redirect to home/dashboard
      router.replace("/");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong during login.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            FleetNow Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
