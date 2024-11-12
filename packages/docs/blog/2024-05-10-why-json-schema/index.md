---
slug: why-json-schema
title: Why JSON Schema?
authors: [fhur]
tags: [devlog]
---

## Why json-schema?

I wanted to drop a few words on why we're chosing `JSON schema` as an intermediate representation for our schemas. Putting it in writing will make it clearer, so here goes.

## The goal: Static & Runtime information about your schema

Let's start by asking ourselves what is the goal: the goal is to have schema information available to the query builder so you can build queries safely (no typos) and with great DX (auto completion).

To achieve this, the query builder needs to know the shape of your DB schema and convert it to something that the TypeScript compiler can understand.

So we know that the query builder needs static type information. What's new is that the query builder also needs information at runtime about your schema. Let's look at a few examples that we want to support:

### Sub goal: select all fields

Let's look at a very basic example. Find an actor by ID.

```ts
from('actors').filter({ id: 1 }).first();
```

We expect this to compile to something like

```sql
select actor_id, name, ...
from actors
where id = $1
```

Notice that I didn't write `select *`. That's intentional, because we can only select "selectable" fields. So the query builder needs to let the columns "default" to something like `Object.keys(db.actors.columns)`. This is hint #1 that we need the schema available at runtime.

### Sub goal: infer the groupingId

```ts
from('actor')
  .filter({id})
  .include({ films })
  .first()
  .groupingId('actor_id') # <======= WHY DO I HAVE TO DO THIS?
```

As you've already experienced the grouping ID is an annoyance. In most cases we can simply infer it: it's the primary key of the table. To actually infer it we need to have at runtime, type information available to the query builder so that the query builder can do something like

```ts
const groupingId = db.actor.primaryKey;
```

Both of these sub-goals imply that in the near future the query builder will be passed not just the DB static type, but also some kind of runtime information about your schema.

```ts
// old version: only has static type information available
const from = query<DB>().from;

// new version: has both static and runtime type information available
const from = query<DB>(db).from;
```

## So... why JSON schema?

Ok, now that we've talked about some of the goals we want to support: let's go back to the original question. Why is JSON schema a good choice?

1.  There is great tooling support for JSON schema: We can find libraries that generate zod from JSON schema or generate TypeScript types from json schema.

1.  Building a JSON schema programmatically is really easy. Converting from `pg-extract-schema` to JSON schema is trivial, and very easy to unit test.

1.  JSON schema itself is available at runtime: As JSON schema is just a plain old javascript object, it's available at runtime, and so we can pass it to the query builer as input so it can use it to infer the groupingId and select all the fields.

1.  Runtime type checking: In the future we will want to add something like zod to the `QueryEngine` so that it blocks malformed queries. Using JSON Schema we can get zod for free.
