# Query composition & reuse

In my opinion one of the bigger issues with SQL is the fact that you cannot compose larger queries from simpler queries.

Effectively this means that it is impossible to share SQL fragments between queries, so if you have a `person` query and a `pet` query, to make a `pet` with `person` query you have to make a completely different query.

SynthQL is designed for composition and lets you achieve this in several ways. Let's see a few examples:

## Defining fragments

The first step towards reusable queries is to be able to give a name to a table + columns. I call these `fragments` and they can be defined as follows

```ts
// A view over the pets table
const pet = from('pets').columns('id', 'name');

// A view over the person table
const person = from('person').columns('id', 'name', 'age');

// A detailed view into the person table, along with their pets
const personDetailed = from('person')
    .columns('id', 'name', 'age', 'created_at', 'updated_at')
    .include({
        pet: pet.filter({ owner_id: col('person.id') }).all(),
    });
```

Once you have views, you can easily turn these into queries as follows:

```ts
function findPetById(id: number) {
    return pet.filter({ id }).first();
}

function findPersonLight(id: number) {
    return person.filter({ id }).first();
}

function findPersonDetails(id: number) {
    return personDetailed.filter({ id }).first();
}
```
