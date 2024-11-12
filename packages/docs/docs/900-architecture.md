# Architecture

This is a brief, high level guide that documents SynthQL's architecture.

## Package structure

SynthQL is composed of 7 packages:

1.  `@synthql/queries`: contains the SynthQL query builder and common types. This package can be used both in client and server code.

1.  `@synthql/backend`: contains the query engine, `QueryEngine`, which executes SynthQL queries. You will usually want to use this inside an HTTP server, and send queries from your client apps via HTTP request, but you can also use it to execute SynthQL queries directly (inside a Node.js script).

1.  `@synthql/react`: contains a [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/installation) client, `useSynthql()`, that can be used in a React or "React-based" framework app, to send SynthQL queries to an HTTP server instance of the query engine.

1.  `@synthql/handler-express`: contains a handler function, `createExpressSynthqlHandler`, that you can use in [Express.js](https://expressjs.com/en/starter/installing.html) apps to parse and execute SynthQL queries sent over HTTP.

1.  `@synthql/handler-next`: contains a handler function, `createNextSynthqlHandler`, that you can use in [Next.js](https://nextjs.org/docs/14/getting-started/installation) apps to parse and execute SynthQL queries sent over HTTP.

1.  `@synthql/cli`: contains a CLI that you can use to generate the TypeScript types and schema files for your database.

1.  `@synthql/introspect`: contains a generator function, `generate()`, that generates the database types and schema definitions; the same function that the CLI wraps. You can use this function to generate the same output without the CLI wrapper.

These are the dependencies between the packages:

![SynthQL packages](/img/architecture/packages.png)

## Information flow

This diagram shows how information flows through SynthQL. Requests are made by the client using `useSynthql()`, which just sends the query over to the `POST /synthql` endpoint.

This then feeds the query to the handler, which parses the query from the request object, and sends it to the `QueryEngine`, which eventually compiles the query down to plain SQL and in turn sends it to the connected PostgreSQL database.

![Information flow](/img/architecture/flow.png)
