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

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Step 1: Login
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Login failed. No user found.");
      setLoading(false);
      return;
    }

    // Step 2: Fetch full name from app_users
    const { data: userProfile, error: userFetchError } = await supabase
      .from("app_users")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (userFetchError) {
      setError("Failed to load user profile.");
      setLoading(false);
      return;
    }

    const { data: userProfile1, error: userFetchError1 } = await supabase
      .from("app_users")
      .select("email")
      .eq("id", user.id)
      .single();

    if (userFetchError1) {
      setError("Failed to load user profile.");
      setLoading(false);
      return;
    }

    // Step 3: Store full name locally
    if (userProfile?.full_name) {
      localStorage.setItem("full_name", userProfile.full_name);
    }
    if (userProfile1?.email) {
      localStorage.setItem("email", userProfile1.email);
    }

    // Step 4: Redirect to dashboard/home
    router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-2xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
