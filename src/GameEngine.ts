import { Observable, interval, Observer, merge } from 'rxjs';
import { scan, map, take, takeUntil, takeWhile } from 'rxjs/operators';

export type GameState = {
  items: FallingItem[];
  itemsCut: number;
  itemsMissed: number;
  cutter: Cutter;
  direction: Direction;
}

type FallingItem = {
  id: number;
  left: number;
  top: number;
  width: number;
  isCut: boolean;
  isMissed: boolean;
}

type Cutter = { left: number; width: number; }

type Milliseconds = number;

type Direction = 'right' | 'left' | null;

type CreateGameParams = { 
  onChange: (gameState: GameState) => void;
  generator: {
    maxItems: number;
    interval: Milliseconds;
  }
  cutter: Cutter
  controls: { 
    subscribe(callback: (direction: Direction) => void): void; 
    unsubscribe(): void; 
  }
}

export function createGame({ onChange, cutter, generator, controls }: CreateGameParams): () => void {

  const itemWidth = 10;

  const randomItemLeft = () => Math.round(Math.random() * 100 - itemWidth);

  const initialState: GameState = {
    items: [],
    itemsCut: 0,
    itemsMissed: 0,
    cutter,
    direction: null
  }

  const calcInterval = 100;
  const stateCalc$ = interval(calcInterval);
  const acceleratorData$: Observable<Direction> = Observable.create((observer: Observer<Direction>) => {
    controls.subscribe(direction => observer.next(direction));
  });

  const newItemEvents$ = interval(generator.interval).pipe(
    map<number, { newItem: FallingItem }>(id => ({ newItem: { id, left: randomItemLeft(), top: 0, width: itemWidth, isCut: false, isMissed: false } })),
    take(generator.maxItems)
  );

  const directionEvents$ = acceleratorData$.pipe(
    map(direction => ({ direction }))
  );
  
  const timeDeltaEvents$ = stateCalc$.pipe(map(() => ({ delta: calcInterval })));

  const events$ = merge(newItemEvents$, directionEvents$, timeDeltaEvents$);

  const mainSubscription = events$
    .pipe(scan(reduceGameState, initialState), takeWhile(state => state.items.length < generator.maxItems || state.items.some(isItemActive), true))
    .subscribe(onChange);

  return () => {
    controls.unsubscribe();
    mainSubscription.unsubscribe();
  };
}

type GameEvent = {
  delta?: Milliseconds;
  newItem?: FallingItem;
  direction?: Direction;
}

function reduceGameState(prevState: GameState, event: GameEvent): GameState {
  const { newItem, direction, delta } = event;

  if (newItem !== undefined) {
    return {
      ...prevState,
      items: [newItem, ...prevState.items]
    }
  }

  if (direction !== undefined) {
    return {
      ...prevState,
      direction
    }
  }
  
  if (delta !== undefined) {
    const itemSpeed = 0.025; // percents per millisecond
    const cutterSpeed = 0.040; // percents per millisecond
    const reduceItemState = (item: FallingItem) => {
      if (isItemActive(item) === false) return item;
      const top = item.top + itemSpeed * delta;
      return ({ ...item, top, isCut: itemIntersectsCutter(item, prevState.cutter), isMissed: item.top >= 100 });
    };

    const itemsInGame = prevState.items.map(reduceItemState);
    const cutterLeft = Math.min(Math.max(prevState.cutter.left + cutterSpeed * delta, 100 - prevState.cutter.width), 0);
    return {
      ...prevState,
      items: itemsInGame,
      cutter: {
        ...prevState.cutter,
        left: cutterLeft
      }
    }
  }

  throw new Error('Must not fall here: event was empty?');
}

function isItemActive(item: FallingItem) {
  return !item.isCut && !item.isMissed;
}

function itemIntersectsCutter (item: FallingItem, cutter: Cutter) {
  return item.top > 95 && ((item.left < cutter.left) || (item.left + item.width > cutter.left + cutter.width));
}