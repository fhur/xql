import React, { ReactNode } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

interface InstallPackageProps {
    packageName: string;
    children: ReactNode;
}

export default function InstallPackage({ packageName }: InstallPackageProps) {
    return (
        <Tabs>
            <TabItem value="npm" label="npm">
                <CodeBlock language="bash">
                    {` npm install ${packageName}`}
                </CodeBlock>
            </TabItem>
            <TabItem value="yarn" label="yarn">
                <CodeBlock language="bash">
                    {`bash yarn add ${packageName}`}
                </CodeBlock>
            </TabItem>
            <TabItem value="pnpm" label="pnpm">
                <CodeBlock language="bash">
                    {`bash pnpm add ${packageName}`}
                </CodeBlock>
            </TabItem>
        </Tabs>
    );
}
