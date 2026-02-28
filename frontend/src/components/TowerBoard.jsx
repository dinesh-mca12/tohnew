import { memo, useMemo, useState } from 'react';
import { DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { motion } from 'framer-motion';

const diskColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-orange-500'];

function TowerBoard({ towers, onMove, soundEnabled }) {
  const [shakeTower, setShakeTower] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const topDiskLocations = useMemo(() => {
    const map = new Map();
    towers.forEach((tower, towerIndex) => {
      if (tower.length) {
        map.set(tower[tower.length - 1], towerIndex);
      }
    });
    return map;
  }, [towers]);

  const playErrorTone = () => {
    if (!soundEnabled) {
      return;
    }
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(180, context.currentTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.05, context.currentTime);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  };

  const onDragEnd = ({ active, over }) => {
    if (!over) {
      return;
    }
    const fromTower = Number(active.data.current?.towerIndex);
    const toTower = Number(over.id);
    const ok = onMove(fromTower, toTower);
    if (!ok) {
      setShakeTower(toTower);
      playErrorTone();
      setTimeout(() => setShakeTower(null), 300);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {towers.map((tower, idx) => (
          <TowerColumn
            key={idx}
            id={idx}
            disks={tower}
            isShaking={shakeTower === idx}
            topDiskLocations={topDiskLocations}
          />
        ))}
      </div>
    </DndContext>
  );
}

function TowerColumn({ id, disks, isShaking, topDiskLocations }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <motion.div
      ref={setNodeRef}
      animate={isShaking ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.24 }}
      className={`relative flex h-72 flex-col-reverse items-center justify-start rounded-xl border-2 p-2 sm:h-80 ${
        isOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <div className="absolute bottom-3 h-2 w-20 rounded bg-slate-300 dark:bg-slate-600" />
      <div className="absolute bottom-5 h-52 w-2 rounded bg-slate-400 dark:bg-slate-500 sm:h-60" />
      <div className="z-10 flex w-full flex-col-reverse items-center gap-2 pb-5">
        {disks.map((disk) => (
          <DiskItem
            key={disk}
            disk={disk}
            towerId={id}
            draggable={topDiskLocations.get(disk) === id}
          />
        ))}
      </div>
    </motion.div>
  );
}

function DiskItem({ disk, towerId, draggable }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${towerId}-${disk}`,
    disabled: !draggable,
    data: { towerIndex: towerId },
  });

  const widthClass = `w-[${50 + disk * 18}px]`;
  const style = {
    width: `${50 + disk * 18}px`,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.7 : 1,
    touchAction: 'none',
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      style={style}
      {...listeners}
      {...attributes}
      className={`h-7 cursor-${draggable ? 'grab' : 'not-allowed'} rounded-md ${widthClass} ${diskColors[(disk - 1) % diskColors.length]} border border-slate-200 dark:border-slate-700`}
    />
  );
}

export default memo(TowerBoard);
