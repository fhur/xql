import CodeBlock from '@theme/CodeBlock';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): JSX.Element {
    return (
        <Layout
            title={`SynthQL: type-safe, composable queries`}
            description="The type-safe, composable query language"
        >
            <header
                style={{
                    minHeight: '70vh',
                    // Theme-safe background color
                    background: 'var(--ifm-hero-background)',
                    width: '100vw',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <div
                    style={{
                        maxWidth: 600,
                        padding: 20,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                    }}
                >
                    <div
                        style={{
                            background: "url('./img/logo.webp')",
                            height: '80px',
                            width: '80px',
                            backgroundSize: 'cover',
                            borderRadius: '100%',
                            margin: '0 auto',
                        }}
                    />
                    <h1 style={{ textAlign: 'center' }}>SynthQL</h1>
                    <p>
                        The type-safe HTTP client for your PostgreSQL database.
                    </p>

                    <Link to="/docs/getting-started">
                        <button className="button button--primary button--lg">
                            Get started
                        </button>
                    </Link>
                </div>
            </header>

            <div style={{ height: 80 }} />

            <main className="container">
                <section
                    style={{
                        minHeight: '70vh',
                        display: 'flex',
                        gap: 0,
                        flexDirection: 'column',
                        padding: 40,
                    }}
                >
                    <div className="row">
                        <div className="col col--6">
                            <h2>What is SynthQL?</h2>

                            <p>
                                SynthQL is a full-stack HTTP client for your
                                PostgreSQL database. It lets you declaratively
                                describe your client components' data
                                dependencies.
                            </p>

                            <p>
                                With SynthQL, you can focus on building great
                                products instead of spending time thinking about
                                how to efficiently fetch data into your
                                components.
                            </p>

                            <p>
                                SynthQL reads your PostgreSQL database schema
                                and generates types, so you get type safety
                                end-to-end.
                            </p>
                        </div>

                        <div className="col col--6">
                            <CodeBlock language="typescript">
                                {[
                                    `// Compose your query using the query builder`,
                                    `const q = from('movies')`,
                                    `  .columns('id', 'title')`,
                                    `  .filter({ id: 1 })`,
                                    `  .take(2);`,
                                    ``,
                                    `// Executing the query`,
                                    `const { data: movies } = queryEngine.executeAndWait(q);`,
                                    ``,
                                    `console.log(movies);`,
                                    `// Will print:`,
                                    `[`,
                                    ` { id: 1, title: 'The Empire Strikes Back' },`,
                                    `];`,
                                ].join('\n')}
                            </CodeBlock>
                        </div>
                    </div>
                </section>

                <section>
                    <h1>Why SynthQL?</h1>
                    <div
                        style={{
                            marginTop: 40,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 80,
                        }}
                    >
                        {features.map(
                            ({ title, link, description, code }, i) => {
                                const blocks = [
                                    <div className="col col--6">
                                        <div
                                            style={{
                                                height: '100%',

                                                borderRadius: 16,
                                            }}
                                        >
                                            <Heading as="h3">{title}</Heading>
                                            <p
                                                style={{
                                                    // preserve white space
                                                    whiteSpace: 'pre-wrap',
                                                }}
                                            >
                                                {description}
                                            </p>
                                            {link && (
                                                <Link to={link}>Read more</Link>
                                            )}
                                        </div>
                                    </div>,
                                    <div className="col col--6">
                                        <CodeBlock language="typescript">
                                            {code}
                                        </CodeBlock>
                                    </div>,
                                ];

                                return <div className="row">{blocks}</div>;
                            },
                        )}
                    </div>
                </section>

                <section
                    style={{
                        display: 'grid',
                        placeItems: 'center',
                        minHeight: '60vh',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 16,
                            transform: 'translateY(-20%)',
                        }}
                    >
                        <h2>Ready to get started?</h2>
                        <Link to="/docs/getting-started">
                            <button className="button button--primary button--lg">
                                Jump to the docs!
                            </button>
                        </Link>
                    </div>
                </section>
            </main>
        </Layout>
    );
}

const features: Array<{
    title: string;
    description: string;
    link?: string;
    code: string;
}> = [
    {
        title: 'End-to-end type safety',
        description:
            'Generate types from your schema with a single command. These types will then power the type-safety provided by the query builder. You should run this command on your CI to ensure that the types are always up to date.',
        link: '/docs/generating-types',
        code: [
            `// Running the command:`,
            `npx @synthql/cli generate --url $DATABASE_URL`,
            ``,
            `// generates a database types file like:`,
            `
export interface DB {
    actor: {
        columns: {
            actor_id: {
                type: number;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: true;
            };
            first_name: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
            last_name: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
            last_update: {
                type: string;
                selectable: true;
                includable: true;
                whereable: true;
                nullable: false;
                isPrimaryKey: false;
            };
        };
    }
}

// which in turn, allows you to create queries like:
const q = from('actor')
    .columns('actor_id', 'first_name', 'last_name')
    .filter({ actor_id: 1 })
    .first();
            `,
        ].join('\n'),
    },
    {
        title: 'Composable query language',
        description:
            'Build complex queries by composing smaller queries. The SynthQL query language is designed for easy composition and reusability.',
        link: '/docs/query-language/composition',
        code: [
            `const findPetsByOwner = (owner) =>`,
            `    from('pets')`,
            `        .filter({ owner })`,
            `        .all();`,
            ``,
            `const findPersonById = (id) => {`,
            `    const pets = findPetsByOwner(id);`,
            ``,
            `    return from('people')`,
            `        .filter({ id })`,
            `        .include({ pets })`,
            `        .firstOrThrow();`,
            `};`,
        ].join('\n'),
    },
    {
        title: 'Deferred queries',
        description: [
            `As queries grow in size, latency increases. Deferred queries allow you to split large object graphs, optimizing page load times.`,
            '',
            'In the following example, we use a deferred query to load the store and its products separately. This allows the store to load quickly, while the products load in the background.',
            '',
            `This is particularly useful when the products aren't immediately visible on the page.`,
        ].join('\n'),
        link: '/docs/deferred-queries',
        code: `
const products = from('products')
    .column('id', 'name', 'price')
    .filter({
        product_id: { in: col('store.product_ids') }
    })
    .defer()
    .all();

const query = from('store')
    .column('id', 'name')
    .filter({ id })
    .include({
        products
    })
    .all();

/* This returns two JSON lines */

// First line of JSON:
[{ "id": "1", "name": "Fancy store", "products": { "status": "pending" }}]

// Once the products have loaded:
[{ "id": "1", "name": "Fancy store", "products": { "status": "done", "data": [{ "id": "1", "name": "Shoe", "price": 199 }] }}]
        `,
    },

    {
        title: 'Security',
        link: '/docs/security',
        description:
            'SynthQL offers several security features to help secure your application, including built-in authentication, query whitelisting, and more.',
        code: `
const findPetsByOwner = (ownerId) => {
    return from('pets')
        .column('name', 'id')
        .filter({ ownerId })
        .permissions('users:read', 'pets:read')
        .all();
};

const findPersonByIds = (ids) => {
    return from('people')
        .column('first_name','last_name')
        .filter({ id: { in: ids }})
        .permissions('person:read')
        .include({
            films: findPetsByOwner(col('people.id'))
        })
        .all();
};`,
    },

    {
        title: 'Custom query providers',
        link: '/docs/custom-providers',
        description:
            'Not all data comes from the database. Use custom providers to join your database tables with data from third-party APIs, ensuring predictable performance.',
        code: `
const findFilmsWithRatings = () => {
    const ratings = from('rotten_tomatoes_ratings')
        .filter({
            year: col('film.year')
        })
        .all();

    return from('films')
        .filter({ year: 1965 })
        .include({ ratings })
        .all();
};`,
    },
];
