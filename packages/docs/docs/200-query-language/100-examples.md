# Examples

## Find 1 actor, with all selectable columns auto-selected, and no filters specified

Finds 1 record in the `actor` table

```ts
const q = from('actor').firstOrThrow();
```

## Find 0 or 1 actor(s), with all selectable columns auto-selected, and no filters specified

Finds 0 or 1 record(s) in the `actor` table

```ts
const q = from('actor').first();
```

## Find 1 actor by ID, with all selectable columns auto-selected

Finds 1 record in the `actor` table where the `actor_id` is in the list of IDs passed, and returns all selectable columns

```ts
const q = from('actor')
    .filter({ actor_id: { in: [1] } })
    .firstOrThrow();
```

## Find 0 or 1 actor(s) by ID, with all selectable columns auto-selected

Finds 0 or 1 record(s) in the `actor` table where the `actor_id` is in the list of IDs passed, and returns all selectable columns

```ts
const q = from('actor')
    .filter({ actor_id: { in: [1] } })
    .first();
```

## Find 0 through n actor(s) by IDs, with columns to return specified

Finds 0 through n record(s) in the `actor` table where their `actor_id` is in the list of IDs passed, and returns all selected columns

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .filter({ actor_id: { in: ids } })
    .all();
```

## Find 0 through n actor(s) with `limit(n)` of results to return specified

Finds 0 through n record(s) in the `actor` table, where `n` is the value passed to `limit()`

```ts
const q = from('actor').limit(2).all();
```

## Find 0 through n actor(s) with number of results to `take(n)` (shorthand for `.limit(n).all()`) specified

Finds 0 through n record(s) in the `actor` table, where `n` is the value passed to `take()`

```ts
const q = from('actor').take(2);
```

## Find 1 actor with `offset(n)` (offset value) specified

Finds 1 record in the `actor` table, starting from the `offset(n)` (offset value) position

```ts
const q = from('actor').offset(1).firstOrThrow();
```

## Find 1 customer by ID with a single-level-deep `include()`

Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

```ts
const store = from('store')
    .columns('store_id', 'address_id', 'manager_staff_id', 'last_update')
    .filter({
        store_id: col('customer.store_id'),
    })
    .firstOrThrow();

const q = from('customer')
    .columns(
        'customer_id',
        'store_id',
        'first_name',
        'last_name',
        'email',
        'last_update',
    )
    .filter({ customer_id: { in: [1] } })
    .include({ store })
    .firstOrThrow();
```

## Find 1 customer by ID with a two-level-deep `include()`

Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

```ts
const address = from('address')
    .columns('address_id', 'city_id', 'address', 'district', 'last_update')
    .filter({
        address_id: col('store.address_id'),
    })
    .firstOrThrow();

const store = from('store')
    .columns('store_id', 'address_id', 'manager_staff_id', 'last_update')
    .filter({
        store_id: col('customer.store_id'),
    })
    .include({ address })
    .firstOrThrow();

const q = from('customer')
    .columns(
        'customer_id',
        'store_id',
        'first_name',
        'last_name',
        'email',
        'last_update',
    )
    .filter({ customer_id: { in: [4] } })
    .include({ store })
    .firstOrThrow();
```

## Find 1 customer by ID with a three-level-deep `include()`

Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

```ts
const city = from('city')
    .columns('city_id', 'country_id', 'city', 'last_update')
    .filter({
        city_id: col('address.city_id'),
    })
    .firstOrThrow();

const address = from('address')
    .columns('address_id', 'city_id', 'address', 'district', 'last_update')
    .filter({
        address_id: col('store.address_id'),
    })
    .include({ city })
    .firstOrThrow();

const store = from('store')
    .columns('store_id', 'address_id', 'manager_staff_id', 'last_update')
    .filter({
        store_id: col('customer.store_id'),
    })
    .include({ address })
    .firstOrThrow();

const q = from('customer')
    .columns(
        'customer_id',
        'store_id',
        'first_name',
        'last_name',
        'email',
        'last_update',
    )
    .filter({ customer_id: { in: [4] } })
    .include({ store })
    .firstOrThrow();
```

## Find 1 customer by ID with a four-level-deep `include()`

Finds 1 record in the `customers` table where the `actor_id` is in the list of IDs passed

```ts
const country = from('country')
    .columns('country_id', 'country', 'last_update')
    .filter({
        country_id: col('city.country_id'),
    })
    .firstOrThrow();

const city = from('city')
    .columns('city_id', 'city', 'country_id', 'last_update')
    .filter({
        city_id: col('address.city_id'),
    })
    .include({ country })
    .firstOrThrow();

const address = from('address')
    .columns('address_id', 'city_id', 'address', 'district', 'last_update')
    .filter({
        address_id: col('store.address_id'),
    })
    .include({ city })
    .firstOrThrow();

const store = from('store')
    .columns('store_id', 'address_id', 'manager_staff_id', 'last_update')
    .filter({
        store_id: col('customer.store_id'),
    })
    .include({ address })
    .firstOrThrow();

const q = from('customer')
    .columns(
        'customer_id',
        'store_id',
        'first_name',
        'last_name',
        'email',
        'last_update',
    )
    .filter({ customer_id: { in: [4] } })
    .include({ store })
    .firstOrThrow();
```
