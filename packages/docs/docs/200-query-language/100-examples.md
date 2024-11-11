# Examples

## Find a single actor by ID with all selectable columns auto-selected

Finds 0 or 1 record(s) in the `actors` table where the `actor_id` is in the list of IDs passed, and return all selectable columns

```ts
const q = from('actor')
    .filter({ actor_id: { in: [1] } })
    .firstOrThrow();
```

## Find a single actor by ID with columns to return specified

Finds 0 or 1 record(s) in the `actors` table where the `actor_id` is in the list of IDs passed, and returns all selected columns

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .filter({ actor_id: { in: [1] } })
    .first();
```

## Find a single actor with no filters specified

Finds 0 or 1 record(s) in the `actors` table

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .firstOrThrow();
```

## Find a single actor with offset value specified

Finds 0 or 1 record(s) in the `actors` starting from the offset value position

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .offset(1)
    .firstOrThrow();
```

## Find a single actor with limit of results to return specified

Finds n record(s) in the `actors`, where `n` is the value passed to `limit()`

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .limit(2)
    .all();
```

## Find a single actor with number of results to take specified

Finds n record(s) in the `actors`, where `n` is the value passed to `take()`

```ts
const q = from('actor').columns('actor_id', 'first_name', 'last_name').take(2);
```

## Find all actors by ids columns to return specified

Finds all the records in the `actors` table where their `actor_id` is in the list of IDs passed, and returns all selected columns

```ts
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .filter({ actor_id: { in: ids } })
    .all();
```

## Find a single actor by ID with a single-level-deep `include()`

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

## Find a single customer by ID with a two-level-deep `include()`

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

## Find a single customer by ID with a three-level-deep `include()`

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

## Find a single customer by ID with a four-level-deep `include()`

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
