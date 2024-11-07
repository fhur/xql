---
slug: rfc-runtime-validation
title: 'RFC: Runtime validation of QueryResult objects'
authors: [fhur]
tags: [rfc]
---

# Introduction

One of the big productivity boosts that SynthQL gives you is the ability to convert your database schema into TypeScript types.

To achieve this, we give you `synthql generate`, which on the surface works pretty well, but has a few big issues:

## 1. Schema drift

Not all PG types can be mapped to TS types manually. Some need to be narrowed manually, for example any JSONB type.

We support overriding types via `synthql.config.json`, but the mechanism is fundamentally unsafe: whatever type you write, correct or not, is compiled to TypeScript. We never actually check that data coming from the database conforms to this type, so over time this introduces the possibility of schema drift.

## 2. Schema override DX

Another annoying issue with SynthQL is the DX for overriding types.
The main issue I have is that the current `.json` based format doesn't let you re-use types, and so if you have a `MonetaryValue` type (for modelling numbers with currencies), you will end up duplicating that JSON Schema type over and over.

## 3. Views

Views turn out to be tremendously useful in SynthQL as they can surmount any limitation on the QueryBuilder's expressiveness.
If you have some query that you can't express with SynthQL, you can first express it as as SQL view, add that view to the `synthql.config.json`, and query it as if it were a table.
There is one problem with views: all the columns are nullable.

# Proposed solution: sampled, runtime validation of QueryResponse objects

The idea is to validate a percentage of all response rows based on a JSON Schema derived from the Query instance.

## How does sampling work?

When a QueryEngine is constructed, we can pass a number indicating how many rows should be validated.

```tsx
// for backend validation
new QueryEngine({
    // Validate 5% of all QueryResults
    // A sample rate of 0 disables it,
    // A sample rate of 1 runs over all results
	runtimeValidationSampleRate:0.05
})
// for frontend validation
<SythQLProvider runtimeValidationSampleRate={0.05} ... />
```

If `runtimeValidationSampleRate > 0`, then we should iterate over the resulting rows and do something like .

```tsx
for (const row of rows) {
    if (Math.random() <= runtimeValidationSampleRate) {
        validateRow(row);
    }
}
```

## What do we validate against?

We start by creating a function that given a query, and the DB's schema, returns the JSON Schema for the result of that query.

```tsx
function getQueryResultSchema(query: AnyQuery, schema: Schema): JSONSchema;
```

This function should be quite straightforward to build.

## Where should we run validation?

There's two possibilities: we either run it in the backend, or in the frontend.

I think we should run it in the frontend. The reason being that the backend could in theory have a schema that is correct, but the frontend has a different schema, in which case you would get no validation errors.

This is not a theoretical case, this can happen if the frontend is on an old version. We often have cases in Luminovo where the frontend is running a version from several weeks ago.

# Putting it all together

```tsx
function createValidator(
    query: AnyQuery,
    schema: Schema,
    sampleRate: number,
): (queryResult) => boolean {
    if (sampleRate === 0) {
        return () => true;
    }
    // this schema should be cached based on
    // the query.hash
    const rowSchema = getCachedJsonSchema(query, schema);

    return (queryResult: unknown) => {
        const rows = Array.isArray(queryResult) ? queryResult : [queryResult];
        for (const row of rows) {
            validateWithSampleRate(row, rowSchema, sampleRate);
        }
    };
}

const validateQueryResult = createValidator({
    query,
    schema,
    sampleRate,
});

const queryEngine = new QueryEngine();

const queryResult = await queryEngine.executeAndWait(query);

validateQueryResult(queryResult);
```
