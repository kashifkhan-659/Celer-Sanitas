// Vercel serverless entry for the whole backend. The catch-all filename means every /api/* path
// reaches this one function with req.url intact, which is what the app's `app.use('/api', ...)`
// mounts already expect — so no rewrite rule and no route changes.
//
// NOT wrapped in serverless-http on purpose. That adapter converts AWS Lambda's (event, context)
// signature; Vercel's Node runtime invokes the handler with real Node (req, res) objects, and an
// Express app IS a (req, res) handler. Wrapping here would hand Express a Lambda event it cannot
// read and 500 every request. Export the app directly.
export { default } from '../server/src/index.js';
