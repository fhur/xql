import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
    title: 'SynthQL',
    tagline: 'A fullstack, type-safe client for your PostgreSQL database',
    favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://synthql.dev',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'synthql', // Usually your GitHub org/user name.
    projectName: 'SynthQL', // Usually your repo name.
    deploymentBranch: 'gh-pages',
    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    plugins: [
        [
            '@docusaurus/plugin-google-gtag',
            {
                trackingID: 'G-EBEHLG81MW',
                anonymizeIP: true, // Anonymize IP in Google Analytics data
            },
        ],
    ],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/synthql/SynthQL/tree/master/packages/docs/',
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        'https://github.com/synthql/SynthQL/tree/master/packages/docs/',
                },
                theme: {
                    customCss: './src/css/custom.css',
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project's social card
        //image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'SynthQL',
            logo: {
                alt: 'SynthQL Logo',
                src: '/img/logo.webp',
                style: {
                    borderRadius: '100%',
                },
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'tutorialSidebar',
                    position: 'left',
                    label: 'Docs',
                },
                { to: '/blog', label: 'Blog', position: 'left' },
                {
                    href: 'https://synthql.dev/reference',
                    label: 'API',
                    position: 'right',
                },
                {
                    href: 'https://github.com/synthql/SynthQL',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Tutorial',
                            to: '/docs/getting-started',
                        },
                        {
                            label: 'API Reference',
                            to: 'https://synthql.dev/reference',
                        },
                        {
                            label: 'Benchmarks',
                            to: 'https://synthql.dev/benchmarks/',
                        },
                    ],
                },
                {
                    title: ' ',
                    items: [],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'GitHub issues',
                            href: 'https://github.com/synthql/SynthQL/issues',
                        },
                        {
                            label: 'Discord',
                            href: 'https://discord.gg/7RWu7rHH9A',
                        },
                    ],
                },
                {
                    title: 'Contact',
                    items: [
                        {
                            label: 'GitHub',
                            to: 'https://github.com/fhur',
                        },
                        {
                            label: 'X',
                            href: 'https://x.com/fernandohur',
                        },
                    ],
                },
            ],
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
