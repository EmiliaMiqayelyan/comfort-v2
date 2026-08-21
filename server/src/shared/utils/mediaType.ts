export type MediaType = 'image' | 'video' | 'pdf' | 'glb' | 'usdz' | 'texture';

export function detectMediaType(mimetype: string, originalname: string): MediaType {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.includes('gltf') || originalname.endsWith('.glb')) return 'glb';
  if (originalname.endsWith('.usdz')) return 'usdz';
  if (mimetype.includes('texture') || originalname.includes('texture')) return 'texture';
  return 'pdf';
}
