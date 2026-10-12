// Purpose-designed light palette for the existing outlined SVG components.
// Geometry, text outlines, masks, and embedded album art remain unchanged.
// This is an asset build step; GitHub never needs CSS filters or JavaScript.
const palette = {
  '#070b0e': '#fbfbfa', '#080e12': '#f7f8f9', '#090c0e': '#fbfbfa',
  '#0e1418': '#f1f3f4', '#10161a': '#f0f2f3', '#11181c': '#f0f2f3',
  '#202a30': '#e3e7ea', '#242d32': '#d7dde1', '#252a2e': '#d7dde1',
  '#283137': '#d7dde1', '#303a41': '#cbd2d7',
  '#62696d': '#cbd2d7', '#626a6d': '#a9b2b9', '#7d8b94': '#8f9ba3',
  '#8d979e': '#6b7983', '#7b858c': '#66717a', '#93999e': '#66717a',
  '#b6babe': '#424a51', '#d7dadd': '#303940',
  '#f1f3f2': '#171b1e', '#f8f8f8': '#171b1e',
  // Increasing contribution intensity becomes progressively darker on white.
  '#191f24': '#edf0f2', '#454e56': '#cbd2d7', '#7d878f': '#929da5',
  '#b6bec4': '#586670', '#f4f4f2': '#172027',
};

export function lightSvg(svg, { images = [] } = {}) {
  let result = svg.replace(/#[\da-f]{6}\b/gi, color => palette[color.toLowerCase()] ?? color);
  for (const [dark, light] of images) result = result.replaceAll(dark, light);
  // Keep dark player labels readable over the right-hand ink landscape.
  result = result.replace(/(<image\b[^>]*\bopacity=")(\.82|\.5)"/g,
    (_, prefix, opacity) => `${prefix}${opacity === '.82' ? '.52' : '.36'}"`);
  return result;
}
