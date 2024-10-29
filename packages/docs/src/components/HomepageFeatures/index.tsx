import clsx from 'clsx';
import Heading from '@theme/Heading';

type FeatureItem = {
    title: string;
    description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
    {
        title: 'Full-stack',
        description: (
            <>
                Docusaurus was designed from the ground up to be easily
                installed and used to get your website up and running quickly.
            </>
        ),
    },
    {
        title: 'Type-safe',
        description: (
            <>
                Docusaurus lets you focus on your docs, and we&apos;ll do the
                chores. Go ahead and move your docs into the <code>docs</code>{' '}
                directory.
            </>
        ),
    },
    {
        title: 'Composable queries',
        description: (
            <>
                Extend or customize your website layout by reusing React.
                Docusaurus can be extended while reusing the same header and
                footer.
            </>
        ),
    },
];

function Feature({ title, description }: FeatureItem) {
    return (
        <div className={clsx('col col--3')}>
            <div className="text--center"></div>
            <div className="text--center padding-horiz--md">
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): JSX.Element {
    return (
        <section
            className={clsx('container')}
            style={{ display: 'flex', flexWrap: 'wrap', padding: '40px' }}
        >
            {FeatureList.map((props, idx) => (
                <Feature key={idx} {...props} />
            ))}
        </section>
    );
}
