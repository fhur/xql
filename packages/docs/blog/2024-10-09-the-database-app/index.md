---
slug: what-are-database-apps
title: 'What are database apps? and why SynthQL?'
authors: [fhur]
tags: [development]
---

# What are database apps? and why SynthQL?

## The database app: a pattern

In my +12y journey as a software developer, I've "re-discovered" a interesting pattern: a surprising number of applications are, at their heart, sophisticated database interfaces. These apps typically serve two main purposes: they store data in a SQL database and offer an intuitive frontend for users to view and manipulate that data.

I say re-discovered, because it's hardly a discovery at all. We've known this for quite a while. We even have a name for the most basic instances of these apps: **CRUD** (Create, Read, Update, Delete) apps. But many other larger and more complex apps fit this category: the "systems of record" apps. These include things like: CRMs, ERPs, billing systems, etc.

There are even companies that have tried to solve this pattern in a generic way such as Airtable, Notion, Retool, and of course the venerable Excel. 

I call these **"database apps"**.

While Airtable et al. are powerful, they are not what I'm looking for. I want an open source **library** that can help me build database apps ontop of my data so I can build a custom (and hopefully great) UX for my users. 

## So what is a database app?

From a product perspective, a database app is essentially a frontend, a database, and a mechanism for reading and writing to the database and a set of rules that govern how the frontend can interact with the database and which data it can access.

Let's give these components names:

1. The UI
2. The database
3. The data-sync layer
4. The authorization layer

### The UI
It is my belief that React solved the UI problem. It's not that React is perfect, but it's a very good abstraction for building complex UIs. The hard parts of UI development are now about "product" which is why I think we see a lot more "product engineer" roles out there, and I think this is a good thing. We've figured out most of the technical challenges of UI development, now we can finally focus on building great user experiences.

### The database
It is also my believe that Postgres has solved the database problem. In which sense? Well, Postgres has more features than most of your engineering team is even aware of, and it has proven itself at a scale that most of us will never reach. In case you weren't aware, Notion, Figma, Gitlab, Adyen, and many more use Postgres as their core datastore.  

### The data-sync layer
This layer deserves a bit of a definition: Most database apps need a way to get data from the DB into the UI. In most environments the DB doesn't fit in the client, so the data needs to be synced. Usually this is done with a REST API.

The problem with the REST API approach is that it's not very "UI friendly". Backend developers usually like to expose nice, clean, "entity" based APIs, but that's not what the user wants. The user wants a mishmash of 20 different entities in one view. And so you end up usually with the frontend fetching 20 endpoints and joining the data, resulting in poor performance, or a custom backend endpoint tightly coupled to a single frontend view.

The other prolem is that we haven't really figured out a way to do this in a generic way. If you look at the typical backend its full of "data fetching" code that converts DB into domain models, then API responses. Id venture to say that easily 30% of backend code is just data fetching.

Another problem is that this data fetching is usually very sub-optimal. Two important problems arise: Over-fetching and non-optimal fetching trees. Let's break them down:
1. **Over-fetching**: As backends grow old, their entities become bloated and so data fetching becomes less and less performant. Suddenly when you call `GET /users/123` you're also getting the user's entire address and purchase history because some view somewhere in the app needed it.

2. **Non-optimal dependency fetching trees**: As entities or endpoints grow, they create dependencies bewteen each other, and so when you fetch a list of users, you might also need to fetch the addresses of all the users. 

This creates what I call a data fetching dependency tree: to fetch the user you first need to fetch the address. This can get quite complicated easily to the point where you often have 3-4 levels of dependencies. 

Now let's assume that there is no over-fetching, meaning you actually need all those entities: what is the most efficient way to fetch the data? A gigantic SQL query? A bunch of small ones? Which ones can be done in parallel? Can some of the data be streamed? What can be fetched from a cache?

Most of these decisions get made implicitly by the developer and they result in non-optimal fetching trees. When people talk about optimizing an endpoint, often they are improving the dependency fetching tree.

### The authorization layer

The final piece of the puzzle is the authorization layer. A very big and important layer that often gets neglected, or implemented poorly.

From a very higih level, the typical backend does 3 things: domain logic, decide what operations a user can perform, and then figure out how to execute those operations in the most efficient way. The part that decides what operations a user can perform is the authorization layer. 

The typical way I see this implemented is essentially by spreading assertions and if statements across the codebase. This makes it really hard to audit and reason about. Even in a small app it's impossible to ask a basic question like "which oeprations am I allowed to perform?" You would have to read the code and trace through the logic.

I think the smart people at Supabase realised that Postgres' Row-level-security (RLS) is maybe enough for many use cases. At least more manageable than a bespoke authorization layer. RLS at least gives you a declarative way to express what operations are allowed and what data is accessible, it's the performance part that seems hard to get right, or at least becomes more fragile if you abuse RLS.

## Ok... but what about SynthQL?

My goal with SynthQL is to make it easier to build database apps. I want to make it so that the average engineer can build a custom frontend for their users without having to worry about any of this complexity.

I find it hard to come up with a catchy name for it, but lately I've been thinking of SynthQL as a secure by default, declarative frontend ORM. Let me illustrate what I mean with an example:

```tsx
// In @yourcompany/queries package
// Declare the query using the type-safe query builder.
// Types are derived from your database schema.
const address = from('addresses')
    .columns('street','city','state','zip')
    .where({user_id: col('users.id')})
    .first()

const userProfileById = (id) => from('users')
    .columns('name','email')
    .where({id})
    .include({address})
    .first()

// In @yourcompany/backend
// Register the query with the query engine. This is typically done once during your backend apps' startup phase.
queryEngine.registerQuery(users)

// In @yourcompany/frontend
// Fetch the query from the frontend app.
const query = userProfileById(123)
const {data: users} = useSynthQL({query, suspense: true})
```


### Declarative

With SynthQL you describe what data you need, from which tables, which colums, etc. It's similar in spirit to GraphQL, but hopefully much simpler. My goal is to make the syntax close enough to SQL that it's intuitive for people with an existing SQL background.

In the example above, 

### Frontend ORM

With SynthQL you can fetch data from your database directly from your React components. This means you can built mini-endpoints that are tightly coupled to the frontend, and so no over or under fetching.

```tsx
function UserProfileView({id}) {
    const address = from('addresses')
        .columns('street','city','state','zip')
        .where({user_id: col('users.id')})
        .requires('address:read')
        .first()

    const userProfileQuery = from('users')
        .columns('name','email')
        .where({id})
        .requires('users:read')
        .include({address})
        .first()

    const {data: userProfile} = useSynthQL({
        query: userProfileQuery, 
        suspense: true
    })

    return <div>
        <h1>{userProfile.name}</h1>
        <p>{userProfile.email}</p>
        <Address address={userProfile.address} />
    </div>
}
```

### Secure by default

SynthQL has two security features that set it apart: Declarative role based access controls and query whitelisting.

When you declare a query, you specify which roles are required to execute it. You also need to whitelist the query with the backend, so that the backend can check that the user has the necessary roles to execute the query.

What this gives you is a declarative way to specify access control. You can specify that a user must have the `users:read` role to execute the `userProfileById` query. 

By requiring whitelisted queries, you can be sure that malicious actors cannot execute arbitrary queries.

Note that you can still use RLS.










