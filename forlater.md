Server is running on PORT:4000
Failed to save activity log: DrizzleQueryError: Failed query: insert into "activity*logs" ("id", "user_id", "action", "entity_type", "entity_id", "metadata", "ip", "user_agent", "created_at") values (default, $1, $2, $3, $4, $5, $6, $7, default)
params: face790f-b1bc-44e6-a208-249f63fe4b7c,news.create,news,f43f669b-3855-441b-a4de-c3f077b49553,{"title":"कान्तिपुर मीडिया ग्रुप का लीड सिनिअर देभेलपर मनिश कुमार देव "},,Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36
at NodePgPreparedQuery.queryWithCache (/Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/drizzle-orm@0.45.1*@types+pg@8.16.0_pg@8.18.0/node*modules/src/pg-core/session.ts:73:11)
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async Function.log (/Users/dbeee/work/kmg-ai-news/admin-server/src/services/activity-log-service.ts:25:7)
... 4 lines matching cause stack trace ...
at async dispatch (file:///Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/hono@4.11.7/node_modules/hono/dist/compose.js:22:17)
at async adminAuthMiddleware (/Users/dbeee/work/kmg-ai-news/admin-server/src/middleware/admin-auth-middleware.ts:16:5)
at async dispatch (file:///Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/hono@4.11.7/node_modules/hono/dist/compose.js:22:17) {
query: 'insert into "activity_logs" ("id", "user_id", "action", "entity_type", "entity_id", "metadata", "ip", "user_agent", "created_at") values (default, $1, $2, $3, $4, $5, $6, $7, default)',
params: [
'face790f-b1bc-44e6-a208-249f63fe4b7c',
'news.create',
'news',
'f43f669b-3855-441b-a4de-c3f077b49553',
'{"title":"कान्तिपुर मीडिया ग्रुप का लीड सिनिअर देभेलपर मनिश कुमार देव "}',
'',
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
],
cause: error: invalid input syntax for type inet: ""
at /Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/pg-pool@3.11.0_pg@8.18.0/node_modules/pg-pool/index.js:45:11
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async <anonymous> (/Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/drizzle-orm@0.45.1*@types+pg@8.16.0_pg@8.18.0/node*modules/src/node-postgres/session.ts:149:14)
at async NodePgPreparedQuery.queryWithCache (/Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/drizzle-orm@0.45.1*@types+pg@8.16.0_pg@8.18.0/node*modules/src/pg-core/session.ts:71:12)
at async Function.log (/Users/dbeee/work/kmg-ai-news/admin-server/src/services/activity-log-service.ts:25:7)
at async <anonymous> (/Users/dbeee/work/kmg-ai-news/admin-server/src/services/admin-news-service.ts:127:7)
at async NodePgSession.transaction (/Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/drizzle-orm@0.45.1*@types+pg@8.16.0_pg@8.18.0/node_modules/src/node-postgres/session.ts:259:19)
at async Function.createNews (/Users/dbeee/work/kmg-ai-news/admin-server/src/services/admin-news-service.ts:54:20)
at async <anonymous> (/Users/dbeee/work/kmg-ai-news/admin-server/src/routes/admin-news-route.ts:41:17)
at async dispatch (file:///Users/dbeee/work/kmg-ai-news/admin-server/node_modules/.pnpm/hono@4.11.7/node_modules/hono/dist/compose.js:22:17) {
length: 128,
severity: 'ERROR',
code: '22P02',
detail: undefined,
hint: undefined,
position: undefined,
internalPosition: undefined,
internalQuery: undefined,
where: "unnamed portal parameter $6 = ''",
schema: undefined,
table: undefined,
column: undefined,
dataType: undefined,
constraint: undefined,
file: 'network.c',
line: '100',
routine: 'network_in'
}
}
