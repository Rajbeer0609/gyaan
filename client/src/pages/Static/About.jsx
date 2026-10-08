import React from 'react';
import { BRAND_NAME } from '../../utils/constants';

export const AboutPage = () => {
  return (
    <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px', maxWidth: '840px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="editorial-tag" style={{ marginBottom: '16px' }}>
          Maison Heritage & Ethos
        </span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '16px' }}>
          The Philosophy of {BRAND_NAME}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
          Founded on the principle of conscious reduction: stripping away the extraneous to reveal garment purity, sculptural proportion, and tactile supremacy.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.8 }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Material Discipline
          </h2>
          <p>
            Every collection begins not with a sketch, but at the loom. From dense 300+ GSM combed ring-spun cottons woven specifically to resist sagging, to pure 120/2 two-ply Italian organic poplins and raw Japanese shuttle-loom denim, our material standards refuse compromise.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Architectural Geometry
          </h2>
          <p>
            Clothing is functional sculpture. We study the intersection of gravity and garment structure: drop shoulders with engineered slopes, forward double pleats that create fluid volumes in stride, and clean hidden plackets that celebrate continuous lines.
          </p>
        </div>

        <div>
          <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Indian Contemporary Perspective
          </h2>
          <p>
            Proudly rooted in India while conversing with the global avant-garde. Our heritage capsules celebrate artisanal handspun raw silks, matka weaves, and traditional craftsmanship translated into dark, modern editorial silhouettes.
          </p>
        </div>
      </div>
    </div>
  );
};
