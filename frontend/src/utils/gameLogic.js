export const createInitialTowers = (diskCount) => [
  Array.from({ length: diskCount }, (_, i) => diskCount - i),
  [],
  [],
];

export const getMinimumMoves = (diskCount) => (2 ** diskCount) - 1;

export const isValidMove = (towers, fromIndex, toIndex) => {
  if (fromIndex === toIndex) {
    return false;
  }
  const source = towers[fromIndex];
  const target = towers[toIndex];
  if (!source || !source.length) {
    return false;
  }
  const moving = source[source.length - 1];
  const topTarget = target[target.length - 1];
  if (!topTarget) {
    return true;
  }
  return moving < topTarget;
};

export const moveDisk = (towers, fromIndex, toIndex) => {
  const copy = towers.map((tower) => [...tower]);
  const movingDisk = copy[fromIndex].pop();
  copy[toIndex].push(movingDisk);
  return copy;
};

export const isCompleted = (towers, diskCount) => towers[2].length === diskCount;
