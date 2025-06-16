"use client";

import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Added
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

interface Signup1Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
}

const Signup1 = ({
  heading = "Create an Account", // Changed default heading
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  googleText = "Sign up with Google",
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login", // Changed default login URL to be more specific
}: Signup1Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Added

  const { mutate, error } = api.user.registerUser.useMutation({
    onSuccess: () => {
      // Handle successful registration, e.g., redirect to login or dashboard
      console.log("User registered successfully!");
      router.push('/'); // Added redirect to home page
    },
    onError: (error) => {
      // Error is already handled by the error object from useMutation
      console.error("Registration failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ name, email, password });
  };

  return (
    <section className="h-screen bg-muted">
      <div className="flex h-full items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md"
        >
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            {logo && (
              <div className="flex items-center gap-1 lg:justify-start">
                <a href={logo.url}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={160} // Added width
                    height={40}  // Added height
                  />
                </a>
              </div>
            )}
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="text"
                  name="name" // Added name attribute
                  placeholder="Name"
                  required
                  className="bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {error?.data?.zodError?.fieldErrors.name && (
                  <span className="text-xs text-red-500">
                    {error.data.zodError.fieldErrors.name}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  name="email" // Added name attribute
                  placeholder="Email"
                  required
                  className="bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error?.data?.zodError?.fieldErrors.email && (
                  <span className="text-xs text-red-500">
                    {error.data.zodError.fieldErrors.email}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  name="password" // Added name attribute
                  placeholder="Password"
                  required
                  className="bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error?.data?.zodError?.fieldErrors.password && (
                  <span className="text-xs text-red-500">
                    {error.data.zodError.fieldErrors.password}
                  </span>
                )}
              </div>
              {error && !error.data?.zodError && error.message && (
                 <span className="text-xs text-red-500">
                    {error.message.includes("P2002") ? "An account with this email already exists." : error.message}
                 </span>
              )}
              <div className="flex flex-col gap-4">
                <Button type="submit" className="mt-2 w-full">
                  {signupText}
                </Button>
                <Button variant="outline" className="w-full" type="button"> {/* Added type="button" */}
                  <FcGoogle className="mr-2 size-5" />
                  {googleText}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{loginText}</p>
            <a
              href={loginUrl}
              className="font-medium text-primary hover:underline"
            >
              Login
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};

export { Signup1 };
