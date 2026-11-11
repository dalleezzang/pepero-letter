export function layoutLetter(text, availableWidth) {
  const columns = availableWidth < 480 ? 4 : 6;
  const lines = [];
  for (const line of text.split('\n')) {
    const characters = Array.from(line);
    if (!characters.length) lines.push([]);
    for (let i = 0; i < characters.length; i += columns) lines.push(characters.slice(i, i + columns));
  }
  const longest = Math.max(3, ...lines.map(line => line.length));
  const size = Math.min(325, 1020 / longest);
  const lineHeight = size * 1.24;
  const contentHeight = (lines.length - 1) * lineHeight + size * .86;
  const height = Math.max(1200, Math.ceil(contentHeight + 600));
  const startY = height === 1200 ? (height - contentHeight) / 2 : 180;
  return { columns, lines, size, lineHeight, height, startY, toY: Math.min(250, startY - 80), fromY: height - 170 };
}
