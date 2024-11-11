# Deferred queries

## The bigger the query, the longer the latency

One of the disadvantages of large query trees is that they result in proportionally longer latencies. The reason is simple: you have to wait for the entire query tree to load before you can send the response back to the client. So the bigger the query, the longer the wait time.

To mitigate this issue, SynthQL lets you mark parts of your query tree with `.defer()`. A `.defer()` boundary will split your query into two and will tell the `QueryEngine` to flush results to the client in sequences.

This feature is similar to [GraphQL's @defer directive](https://graphql.org/blog/2020-12-08-improving-latency-with-defer-and-stream-directives/).

## Example: store with many products

Let’s imagine that you have a store that sells hundreds of different products. You need to implement a "Store" page that displays the store's properties, and after scrolling down a bit, the user can see a list of all the products sold by the store.

To improve the latency of this page, you can mark the `products` query with `.defer()`, as follows:

```tsx
const products = from('products')
    .column('id', 'name', 'price')
    .defer() // <======= this marks the `products` query to be deferred during execution
    .all();

const query = from('store').column('store_name', 'store_owner').include({
    products,
});

// Execute the query
const result = queryEngine.execute(query);
```

Marking the `products` subquery with `.defer()` will result in the query client first fetching the `store`, and then re-rendering the component once the data from the `products` comes in.

## What happens over the wire

When the `QueryEngine` executes a query, it will flush results 'early' to the client whenever it encounters a `.defer()` boundary. In this example, this will result in two lines of JSON being sent to the client over the same HTTP connection, as shown below:

```json
// First line of JSON:
[{ "store_name": "Fun Inc.", "store_owner": "Bob", "products": { "status": "pending" }}]

// Once the products have loaded:
[{ "store_name": "Toys Inc.", "store_owner": "Bill", "products": { "status": "done", "data": [{ "id": 1, "name": "Shoe", "price": 199 }] }}]
```
