"use client";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";

export function AuthBootstrap() {
  useEffect(() => {
    useAuth.getState().restore();
  }, []);
  return null;
}
