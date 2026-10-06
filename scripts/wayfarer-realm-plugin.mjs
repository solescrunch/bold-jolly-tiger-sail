import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";

const WAYFARER_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../wayfarer",
);
const DATA_DIR = path.join(WAYFARER_ROOT, "runtime");

const PROXY_PREFIXES = [
  "/preview",
  "/dist",
  "/health",
  "/live",
  "/npc",
  "/manus-routes.json",
  "/art",
];

function shouldProxy(url = "") {
  const pathname = url.split("?")[0] ?? "";
  if (pathname === "/socket") return true;
  return PROXY_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

async function startRealm() {
  const { acquireRealmLease, SqliteRealmStore } = await import(
    "../wayfarer/tools/sqlite-store.mjs"
  );
  const { createLocalRealmServer } = await import(
    "../wayfarer/tools/realm-server.mjs"
  );
  const release = await acquireRealmLease(path.join(DATA_DIR, "realm.lease.sqlite"));
  let store;
  try {
    store = await SqliteRealmStore.open(path.join(DATA_DIR, "realm.sqlite"), {
      secure: false,
      maxProfiles: 10000,
    });
    const host = await createLocalRealmServer({
      port: 0,
      bindHost: "127.0.0.1",
      capacity: 16,
      xam: true,
      profileStoreOverride: store,
      xamStoreOverride: store.xam,
    });
    return { host, store, release };
  } catch (error) {
    store?.close();
    release();
    throw error;
  }
}

function proxyHttp(req, res, realmOrigin) {
  const target = new URL(realmOrigin);
  const headers = { ...req.headers, host: target.host, origin: realmOrigin };
  const proxyReq = http.request(
    {
      hostname: target.hostname,
      port: target.port,
      path: req.url,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxyReq.on("error", () => {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader("content-type", "text/plain; charset=utf-8");
      res.end("Wayfarer realm unavailable");
    } else {
      res.end();
    }
  });
  req.pipe(proxyReq);
}

function attachSocketBridge(httpServer, getOrigin) {
  if (!httpServer || httpServer.__wayfarerUpgrade) return;
  httpServer.__wayfarerUpgrade = true;
  const sockets = new WebSocketServer({ noServer: true, maxPayload: 65536 });
  httpServer.on("upgrade", (req, socket, head) => {
    const pathname = (req.url ?? "").split("?")[0];
    if (pathname !== "/socket") return;
    const origin = getOrigin();
    if (!origin) {
      socket.end("HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n");
      return;
    }
    sockets.handleUpgrade(req, socket, head, (client) => {
      const protocol = req.headers["sec-websocket-protocol"];
      const target = new URL(origin);
      const remote = new WebSocket(origin.replace(/^http/, "ws") + "/socket", protocol, {
        headers: {
          Origin: origin,
          Host: target.host,
          Cookie: req.headers.cookie ?? "",
        },
      });
      const queue = [];
      client.on("message", (data, isBinary) => {
        if (isBinary) {
          client.close(1008);
          return;
        }
        const text = data.toString();
        if (remote.readyState === WebSocket.OPEN) remote.send(text);
        else if (queue.length < 8) queue.push(text);
        else client.close(1008);
      });
      remote.on("open", () => {
        for (const packet of queue) remote.send(packet);
        queue.length = 0;
      });
      remote.on("message", (data) => {
        if (client.readyState === WebSocket.OPEN) client.send(data.toString());
      });
      remote.on("close", () => client.close());
      remote.on("error", () => client.close());
      client.on("close", () => remote.close());
      client.on("error", () => remote.close());
    });
  });
}

export function wayfarerRealmPlugin() {
  let realm;

  async function ensureRealm() {
    if (realm) return realm;
    realm = await startRealm();
    console.log(`[wayfarer] realm ${realm.host.origin}`);
    return realm;
  }

  return {
    name: "wayfarer-realm",
    async configureServer(server) {
      const started = await ensureRealm();
      const origin = started.host.origin;

      server.middlewares.use((req, res, next) => {
        if (!shouldProxy(req.url ?? "")) {
          next();
          return;
        }
        proxyHttp(req, res, origin);
      });

      attachSocketBridge(server.httpServer, () => origin);
      return () => attachSocketBridge(server.httpServer, () => origin);
    },
  };
}
