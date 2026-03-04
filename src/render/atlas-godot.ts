import * as fs from 'node:fs';
import type { AtlasMeta } from '../types.js';

/**
 * Convert AtlasMeta to Godot 4.x SpriteFrames .tres format.
 * Groups frames by sprite name into animations.
 */
export function toAtlasGodot(metadata: AtlasMeta, path?: string): string {
  const lines: string[] = [];

  // Header
  const subResourceCount = metadata.frames.length;
  lines.push(`[gd_resource type="SpriteFrames" load_steps=${subResourceCount + 2} format=3]`, '');

  // External resource: the atlas texture
  const imagePath = metadata.image || 'atlas.png';
  lines.push(`[ext_resource type="Texture2D" path="res://${imagePath}" id="1"]`, '');

  // Sub-resources: one AtlasTexture per frame
  for (let i = 0; i < metadata.frames.length; i++) {
    const f = metadata.frames[i]!;
    const id = i + 2; // ext_resource is id=1
    lines.push(
      `[sub_resource type="AtlasTexture" id="${id}"]`,
      `atlas = ExtResource("1")`,
      `region = Rect2(${f.x}, ${f.y}, ${f.w}, ${f.h})`,
      '',
    );
  }

  // Group frames by animation name (sprite name)
  const animations = new Map<string, number[]>();
  for (let i = 0; i < metadata.frames.length; i++) {
    const name = metadata.frames[i]!.name;
    if (!animations.has(name)) {
      animations.set(name, []);
    }
    animations.get(name)!.push(i);
  }

  // Resource block with animations
  lines.push(`[resource]`);
  lines.push(`animations = [{`);

  const animEntries: string[] = [];
  for (const [name, frameIndices] of animations) {
    const frameObjects = frameIndices
      .map((i) => `{ "texture": SubResource("${i + 2}"), "duration": 1.0 }`)
      .join(', ');
    animEntries.push(
      [`"name": &"${name}"`, `"speed": 5.0`, `"loop": true`, `"frames": [${frameObjects}]`].join(
        ', ',
      ),
    );
  }

  lines.push(animEntries.join('\n}, {\n'));
  lines.push(`}]`);

  const content = lines.join('\n');

  if (path) {
    fs.writeFileSync(path, content, 'utf-8');
  }

  return content;
}
