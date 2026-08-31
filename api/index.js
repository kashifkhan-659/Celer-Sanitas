// Vercel serverless entry for the whole backend. Every /api/* path reaches this one function via
// the explicit rewrite in vercel.json, which the app's `app.use('/api', ...)` mounts already expect.
//
// This was previously named api/[...path].js, relying on Vercel's catch-all filename convention.
// That silently half-worked: the deployed function matched ONE path segment, not many, so
// /api/health reached Express while /api/trees/chest_pain and every other real route (all of them
// two segments or deeper) died on Vercel's own NOT_FOUND before Express ever saw them. The `...`
// does not survive being parsed as a glob character class. Routing now lives in an explicit rewrite
// rule instead of in the filename, where nothing has to interpret brackets.
//
// NOT wrapped in serverless-http on purpose. That adapter converts AWS Lambda's (event, context)
// signature; Vercel's Node runtime invokes the handler with real Node (req, res) objects, and an
// Express app IS a (req, res) handler. Wrapping here would hand Express a Lambda event it cannot
// read and 500 every request. Export the app directly.
export { default } from '../server/src/index.js';
