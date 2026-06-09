import { redirect } from "next/navigation";
import { DEFAULT_APP_PATH } from "@/lib/nav-tabs";

export default function FeedPage() {
  redirect(DEFAULT_APP_PATH);
}
