import type { ProjectScreenshot } from '@/types/content.ts';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Carousel from './Carousel.tsx';

const screenshots: ProjectScreenshot[] = [
  { src: '/screenshots/example/one.svg', alt: 'First example screenshot' },
  { src: '/screenshots/example/two.svg', alt: 'Second example screenshot', caption: 'Caption two' },
  { src: '/screenshots/example/three.svg', alt: 'Third example screenshot' },
];

describe('Carousel', () => {
  it('renders every slide with its image and alt text', () => {
    render(<Carousel screenshots={screenshots} label="Example project" />);

    for (const shot of screenshots) {
      expect(screen.getByAltText(shot.alt)).toBeInTheDocument();
    }
  });

  it('renders one dot indicator per slide, with the first marked as active', () => {
    render(<Carousel screenshots={screenshots} label="Example project" />);

    const dots = screen.getAllByRole('tab');
    expect(dots).toHaveLength(screenshots.length);
    expect(dots[0]).toHaveAttribute('aria-selected', 'true');
    expect(dots[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('renders the caption for slides that have one', () => {
    render(<Carousel screenshots={screenshots} label="Example project" />);

    expect(screen.getByText('Caption two')).toBeInTheDocument();
  });

  it('renders nothing when there are no screenshots', () => {
    const { container } = render(<Carousel screenshots={[]} label="Empty project" />);

    expect(container).toBeEmptyDOMElement();
  });
});
