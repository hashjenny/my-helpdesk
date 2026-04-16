import { auth } from "../auth";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("/*", cors());

app.on(["POST", "GET"], "/api/auth/**", (c) =>
  auth.handler({
    request: c.req.raw,
    event: { onRequest: [] },
  })
);

export default app;