import { cookies } from "next/headers";
import { getUserCookieName, parseUserSessionToken } from "./user-auth";

export function getUserSessionFromCookies() {
  const token = cookies().get(getUserCookieName())?.value;
  return parseUserSessionToken(token);
}
