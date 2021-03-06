export type LayoutItemRequired = {
  w: number;
  h: number;
  x: number;
  y: number;
  i: number;
};

export type LayoutItem = LayoutItemRequired & {
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  moved?: boolean;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
};

export type Layout = LayoutItem[];
// export type Position = {left: number, top: number, width: number, height: number};
/*
export type DragCallbackData = {
  node: HTMLElement,
  x: number, y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};
*/
// export type DragEvent = {e: Event} & DragCallbackData;
export type Position = { top: number; left: number };
export type Size = { width: number; height: number };
// export type ResizeEvent = {e: Event, node: HTMLElement, size: Size};

export function getControlPosition(e: any): { x: number; y: number } {
  return offsetXYFromParentOf(e);
}

// Get from offsetParent
export function offsetXYFromParentOf(evt: any): { x: number; y: number } {
  const offsetParent = evt.target.offsetParent || document.body;
  const offsetParentRect =
    evt.offsetParent === document.body
      ? { left: 0, top: 0 }
      : offsetParent.getBoundingClientRect();

  const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left;
  const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top;

  return { x, y };
}

// Create an data object exposed by <DraggableCore>'s events
export function createCoreData(
  lastX: number,
  lastY: number,
  x: number,
  y: number,
): {
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
  x: number;
  y: number;
} {
  // State changes are often (but not always!) async. We want the latest value.
  const isStart = typeof lastX !== 'number';

  if (isStart) {
    // If this is our first move, use the x and y as last coords.
    return {
      deltaX: 0,
      deltaY: 0,
      lastX: x,
      lastY: y,
      x: x,
      y: y,
    };
  }
  // Otherwise calculate proper values.
  return {
    deltaX: x - lastX,
    deltaY: y - lastY,
    lastX: lastX,
    lastY: lastY,
    x: x,
    y: y,
  };
}

// const isProduction = process.env.NODE_ENV === 'production';
/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
export function bottom(layout: Layout): number {
  let max = 0,
    bottomY;
  for (let i = 0, len = layout.length; i < len; i++) {
    bottomY = layout[i].y + layout[i].h;
    if (bottomY > max) max = bottomY;
  }
  return max;
}

export function cloneLayout(layout: Layout): Layout {
  const newLayout = Array(layout.length);
  for (let i = 0, len = layout.length; i < len; i++) {
    newLayout[i] = cloneLayoutItem(layout[i]);
  }
  return newLayout;
}

// Fast path to cloning, since this is monomorphic
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
  /*return {
    w: layoutItem.w, h: layoutItem.h, x: layoutItem.x, y: layoutItem.y, i: layoutItem.i,
    minW: layoutItem.minW, maxW: layoutItem.maxW, minH: layoutItem.minH, maxH: layoutItem.maxH,
    moved: Boolean(layoutItem.moved), static: Boolean(layoutItem.static),
    // These can be null
    isDraggable: layoutItem.isDraggable, isResizable: layoutItem.isResizable
  };*/
  return JSON.parse(JSON.stringify(layoutItem));
}

/**
 * Given two layoutitems, check if they collide.
 *
 * @return {Boolean}   True if colliding.
 */
export function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1 === l2) return false; // same element
  if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
  if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
  if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
  if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
  return true; // boxes overlap
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
export function compact(layout: Layout, verticalCompact = true): Layout {
  // Statics go in the compareWith array right away so items flow around them.
  const compareWith = getStatics(layout);
  // We go through the items by row and column.
  const sorted = sortLayoutItemsByRowCol(layout);
  // Holding for new items.
  const out = Array(layout.length);

  for (let i = 0, len = sorted.length; i < len; i++) {
    let l = sorted[i];

    // Don't move static elements
    if (!l.static) {
      l = compactItem(compareWith, l, verticalCompact);

      // Add to comparison array. We only collide with items before this one.
      // Statics are already in this array.
      compareWith.push(l);
    }

    // Add to output array to make sure they still come out in the right order.
    out[layout.indexOf(l)] = l;

    // Clear moved flag, if it exists.
    l.moved = false;
  }

  return out;
}

/**
 * Compact an item in the layout.
 */
export function compactItem(
  compareWith: Layout,
  l: LayoutItem,
  verticalCompact: boolean,
): LayoutItem {
  if (verticalCompact) {
    // Move the element up as far as it can go without colliding.
    while (l.y > 0 && !getFirstCollision(compareWith, l)) {
      l.y--;
    }
  }

  // Move it down, and keep moving it down if it's colliding.
  let collides;
  while ((collides = getFirstCollision(compareWith, l))) {
    l.y = collides.y + collides.h;
  }
  return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
export function correctBounds(
  layout: Layout,
  bounds: { cols: number },
): Layout {
  const collidesWith = getStatics(layout);
  for (let i = 0, len = layout.length; i < len; i++) {
    const l = layout[i];
    // Overflows right
    if (l.x + l.w > bounds.cols) l.x = bounds.cols - l.w;
    // Overflows left
    if (l.x < 0) {
      l.x = 0;
      l.w = bounds.cols;
    }
    if (!l.static) collidesWith.push(l);
    else {
      // If this is static and collides with other statics, we must move it down.
      // We have to do something nicer than just letting them overlap.
      while (getFirstCollision(collidesWith, l)) {
        l.y++;
      }
    }
  }
  return layout;
}

/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export function getLayoutItem(layout: Layout, id: number): LayoutItem | void {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (layout[i].i === id) return layout[i];
  }
}

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
export function getFirstCollision(
  layout: Layout,
  layoutItem: LayoutItem,
): LayoutItem | void {
  for (let i = 0, len = layout.length; i < len; i++) {
    if (collides(layout[i], layoutItem)) return layout[i];
  }
}

export function getFirstFreeSpace(layout: Layout, colNum = 12): LayoutItem {
  const sorted = sortLayoutItemsByRowCol(layout);
  const rows = {};

  const grid = {} as LayoutItem;

  // sorted.forEach(item => {
  //   if (!rows[item.y]) rows[item.y] = [];
  //   rows[item.y].push(item);
  // });

  // Object.keys(rows).forEach(key => {
  //   const { w, h } = rows[key].reduce(
  //     (acc, i) => {
  //       acc.w += i.w;
  //       acc.h = i.h;
  //       return acc;
  //     },
  //     { w: 0, h: 0 },
  //   );

  //   if (w < colNum && grid.y == undefined) {
  //     grid.x = w;
  //     grid.y = parseInt(key, 10);
  //     grid.w = colNum - w;
  //     grid.h = h;
  //     grid.i = sorted.length;
  //   }
  // });

  if (grid.y === undefined) {
    grid.x = 0;
    grid.y = sorted.reduce((acc, item) => {
      if (item.y + item.h > acc) acc = item.y + item.h;
      return acc;
    }, 0);
    grid.w = 6;
    grid.h = 15;
    grid.i = sorted.length;
  }

  return grid;
}

export function getAllCollisions(
  layout: Layout,
  layoutItem: LayoutItem,
): Array<LayoutItem> {
  return layout.filter(l => collides(l, layoutItem));
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export function getStatics(layout: Layout): Array<LayoutItem> {
  //return [];
  return layout.filter(l => l.static);
}

/**
 * Move an element. Responsible for doing cascading movements of other elements.
 *
 * @param  {Array}      layout Full layout to modify.
 * @param  {LayoutItem} l      element to move.
 * @param  {Number}     [x]    X position in grid units.
 * @param  {Number}     [y]    Y position in grid units.
 * @param  {Boolean}    [isUserAction] If true, designates that the item we're moving is
 *                                     being dragged/resized by th euser.
 */
export function moveElement(
  layout: Layout,
  l: LayoutItem,
  x: number | undefined,
  y: number,
  isUserAction: boolean,
  preventCollision: boolean,
): Layout {
  if (l.static) return layout;

  // Short-circuit if nothing to do.
  //if (l.y === y && l.x === x) return layout;

  const oldX = l.x;
  const oldY = l.y;

  const movingUp = y && l.y > y;
  // This is quite a bit faster than extending the object
  if (typeof x === 'number') l.x = x;
  if (typeof y === 'number') l.y = y;
  l.moved = true;

  // If this collides with anything, move it.
  // When doing this comparison, we have to sort the items we compare with
  // to ensure, in the case of multiple collisions, that we're getting the
  // nearest collision.
  let sorted = sortLayoutItemsByRowCol(layout);
  if (movingUp) sorted = sorted.reverse();
  const collisions = getAllCollisions(sorted, l);

  if (preventCollision && collisions.length) {
    l.x = oldX;
    l.y = oldY;
    l.moved = false;
    return layout;
  }

  // Move each item that collides away from this element.
  for (let i = 0, len = collisions.length; i < len; i++) {
    const collision = collisions[i];
    // console.log('resolving collision between', l.i, 'at', l.y, 'and', collision.i, 'at', collision.y);

    // Short circuit so we can't infinite loop
    if (collision.moved) continue;

    // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
    if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

    // Don't move static items - we have to move *this* element away
    if (collision.static) {
      layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
    } else {
      layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
    }
  }

  return layout;
}

/**
 * This is where the magic needs to happen - given a collision, move an element away from the collision.
 * We attempt to move it up if there's room, otherwise it goes below.
 *
 * @param  {Array} layout            Full layout to modify.
 * @param  {LayoutItem} collidesWith Layout item we're colliding with.
 * @param  {LayoutItem} itemToMove   Layout item we're moving.
 * @param  {Boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
 *                                   by the user.
 */
export function moveElementAwayFromCollision(
  layout: Layout,
  collidesWith: LayoutItem,
  itemToMove: LayoutItem,
  isUserAction: boolean,
): Layout {
  const preventCollision = false; // we're already colliding
  // If there is enough space above the collision to put this element, move it there.
  // We only do this on the main collision as this can get funky in cascades and cause
  // unwanted swapping behavior.
  if (isUserAction) {
    // Make a mock item so we don't modify the item here, only modify in moveElement.
    const fakeItem: LayoutItem = {
      x: itemToMove.x,
      y: itemToMove.y,
      w: itemToMove.w,
      h: itemToMove.h,
      i: -1,
    };

    fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);
    if (!getFirstCollision(layout, fakeItem)) {
      return moveElement(
        layout,
        itemToMove,
        undefined,
        fakeItem.y,
        isUserAction,
        preventCollision,
      );
    }
  }

  // Previously this was optimized to move below the collision directly, but this can cause problems
  // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
  return moveElement(
    layout,
    itemToMove,
    undefined,
    itemToMove.y + 1,
    isUserAction,
    preventCollision,
  );
}

/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export function sortLayoutItemsByRowCol(layout: Layout): Layout {
  return layout.sort((a, b) => {
    if (a.y === b.y && a.x === b.x) {
      return 0;
    }

    if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
      return 1;
    }

    return -1;
  });
}

/**
 * Generate a layout using the initialLayout and children as a template.
 * Missing entries will be added, extraneous ones will be truncated.
 *
 * @param  {Array}  initialLayout Layout passed in through props.
 * @param  {String} breakpoint    Current responsive breakpoint.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout vertically.
 * @return {Array}                Working layout.
 */
/*
export function synchronizeLayoutWithChildren(initialLayout: Layout, children: Array<React.Element>|React.Element,
                                              cols: number, verticalCompact: boolean): Layout {
  // ensure 'children' is always an array
  if (!Array.isArray(children)) {
    children = [children];
  }
  initialLayout = initialLayout || [];
  // Generate one layout item per child.
  let layout: Layout = [];
  for (let i = 0, len = children.length; i < len; i++) {
    let newItem;
    const child = children[i];
    // Don't overwrite if it already exists.
    const exists = getLayoutItem(initialLayout, child.key || "1" /!* FIXME satisfies Flow *!/);
    if (exists) {
      newItem = exists;
    } else {
      const g = child.props._grid;
      // Hey, this item has a _grid property, use it.
      if (g) {
        if (!isProduction) {
          validateLayout([g], 'ReactGridLayout.children');
        }
        // Validated; add it to the layout. Bottom 'y' possible is the bottom of the layout.
        // This allows you to do nice stuff like specify {y: Infinity}
        if (verticalCompact) {
          newItem = cloneLayoutItem({...g, y: Math.min(bottom(layout), g.y), i: child.key});
        } else {
          newItem = cloneLayoutItem({...g, y: g.y, i: child.key});
        }
      }
      // Nothing provided: ensure this is added to the bottom
      else {
        newItem = cloneLayoutItem({w: 1, h: 1, x: 0, y: bottom(layout), i: child.key || "1"});
      }
    }
    layout[i] = newItem;
  }
  // Correct the layout.
  layout = correctBounds(layout, {cols: cols});
  layout = compact(layout, verticalCompact);
  return layout;
}
*/

/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
export function validateLayout(layout: Layout, contextName?: string): void {
  contextName = contextName || 'Layout';
  const subProps: Array<keyof LayoutItemRequired> = ['x', 'y', 'w', 'h'];
  const keyArr = [];
  if (!Array.isArray(layout)) {
    throw new Error(contextName + ' must be an array!');
  }

  for (let i = 0; i < layout.length; i += 1) {
    const item = layout[i];

    for (let j = 0; j < subProps.length; j += 1) {
      if (typeof item[subProps[j]] !== 'number') {
        throw new Error(
          'VueGridLayout: ' +
            contextName +
            '[' +
            i +
            '].' +
            subProps[j] +
            ' must be a number!',
        );
      }
    }

    if (item.i === undefined || item.i === null) {
      throw new Error(
        'VueGridLayout: ' + contextName + '[' + i + '].i cannot be null!',
      );
    }

    if (typeof item.i !== 'number' && typeof item.i !== 'string') {
      throw new Error(
        'VueGridLayout: ' +
          contextName +
          '[' +
          i +
          '].i must be a string or number!',
      );
    }

    if (keyArr.indexOf(item.i) >= 0) {
      throw new Error(
        'VueGridLayout: ' + contextName + '[' + i + '].i must be unique!',
      );
    }
    keyArr.push(item.i);

    if (item.static !== undefined && typeof item.static !== 'boolean') {
      throw new Error(
        'VueGridLayout: ' +
          contextName +
          '[' +
          i +
          '].static must be a boolean!',
      );
    }
  }
}
