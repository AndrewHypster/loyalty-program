import { default as nextAuthMiddleware } from "next-auth/middleware";

export default nextAuthMiddleware; // Експорт функції за замовчуванням

export const config = {
  matcher: [],
};
