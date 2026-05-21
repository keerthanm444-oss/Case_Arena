// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { Citation } from '@/components/mdx/Citation';
import { Framework } from '@/components/mdx/Framework';
import { AssumptionChip } from '@/components/mdx/AssumptionChip';
import { LiveNumber } from '@/components/mdx/LiveNumber';
import { AssumptionProvider } from '@/components/mdx/AssumptionContext';
import { TableOfContents } from '@/components/mdx/TableOfContents';

/**
 * MDX shortcode smoke — each component renders the expected key affordances.
 * Not visual regressions — that's Playwright's job — but enough to catch
 * "I broke the API of this component" between refactors.
 */

describe('MDX · Citation', () => {
  it('renders publisher + year on the trigger', () => {
    render(
      <Citation
        publisher="HBS"
        title="Acme case"
        year={2023}
      />,
    );
    // The publisher appears in the button trigger
    expect(screen.getByRole('button')).toHaveTextContent('HBS');
    expect(screen.getByRole('button')).toHaveTextContent('2023');
  });
});

describe('MDX · Framework', () => {
  it('renders as a link with the framework slug', () => {
    render(<Framework slug="profitability">profit tree</Framework>);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('profitability');
    expect(link).toHaveTextContent('profit tree');
  });

  it('renders as a static span when static prop is set', () => {
    const { container } = render(
      <Framework slug="mece" static>mece</Framework>,
    );
    // Static variant uses a <span>, not a link
    expect(container.querySelector('a')).toBeNull();
  });
});

describe('MDX · AssumptionChip + LiveNumber', () => {
  it('formats values + renders inside a provider', () => {
    render(
      <AssumptionProvider>
        <AssumptionChip name="margin" base={0.2} alt={0.15} label="Margin" decimals={2} />
        <LiveNumber compute="margin * 100" suffix="%" decimals={1} />
      </AssumptionProvider>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('Margin');
    expect(btn).toHaveTextContent('0.20');
  });

  it('LiveNumber renders an em-dash for unparseable formulas', () => {
    render(
      <AssumptionProvider>
        <LiveNumber compute="garbage )(" />
      </AssumptionProvider>,
    );
    // The component shows "—" when evaluation fails
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('MDX · TableOfContents', () => {
  const sample = `# Top
## First section
intro paragraph
## Second section
### Subsection A
text
### Subsection B
text
`;

  it('extracts H2 headers', () => {
    render(<TableOfContents source={sample} depth={2} />);
    expect(screen.getByText('First section')).toBeInTheDocument();
    expect(screen.getByText('Second section')).toBeInTheDocument();
  });

  it('extracts H2 + H3 at depth=3', () => {
    render(<TableOfContents source={sample} depth={3} />);
    expect(screen.getByText('Subsection A')).toBeInTheDocument();
    expect(screen.getByText('Subsection B')).toBeInTheDocument();
  });

  it('renders nothing for empty source', () => {
    const { container } = render(<TableOfContents source="" />);
    // Component returns null when there are no headings
    expect(container.firstChild).toBeNull();
  });
});
