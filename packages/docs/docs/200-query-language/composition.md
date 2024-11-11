# Query composition & reuse

Although SQL supports query composition through JOINs, UNIONs, and subqueries, the readability and maintainability of large composite queries can be a challenge.

SynthQL is designed for this kind of composition and allows you achieve this in several ways. Let's look at a few examples:

## Defining views

The first step towards reusable queries is to be able to give a name to a table and its columns. These are called `views`, and they can be defined as follows:

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

Once you have views, you can easily convert them into queries as follows:

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
