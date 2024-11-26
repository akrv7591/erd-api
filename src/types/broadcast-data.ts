import {NODE_TYPES} from "../enums/node-type";
export type EdgeBase<EdgeData extends Record<string, unknown> = Record<string, unknown>, EdgeType extends string | undefined = string | undefined> = {
  /** Unique id of an edge */
  id: string;
  /** Type of an edge defined in edgeTypes */
  type?: EdgeType;
  /** Id of source node */
  source: string;
  /** Id of target node */
  target: string;
  /** Id of source handle
   * only needed if there are multiple handles per node
   */
  sourceHandle?: string | null;
  /** Id of target handle
   * only needed if there are multiple handles per node
   */
  targetHandle?: string | null;
  animated?: boolean;
  hidden?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  /** Arbitrary data passed to an edge */
  data?: EdgeData;
  selected?: boolean;
  /** Set the marker on the beginning of an edge
   * @example 'arrow', 'arrowclosed' or custom marker
   */
  zIndex?: number;
  ariaLabel?: string;
  /** Padding around the edge where interaction is still possible */
  interactionWidth?: number;
};
export type NodeBase<NodeData extends Record<string, unknown> = Record<string, unknown>, NodeType extends string = string> = {
  /** Unique id of a node */
  id: string;
  /** Position of a node on the pane
   * @example { x: 0, y: 0 }
   */
  position: XYPosition;
  /** Arbitrary data passed to a node */
  data: NodeData;
  /** Type of node defined in nodeTypes */
  type?: NodeType;
  /** Only relevant for default, source, target nodeType. controls source position
   * @example 'right', 'left', 'top', 'bottom'
   */
  sourcePosition?: Position;
  /** Only relevant for default, source, target nodeType. controls target position
   * @example 'right', 'left', 'top', 'bottom'
   */
  targetPosition?: Position;
  hidden?: boolean;
  selected?: boolean;
  /** True, if node is being dragged */
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  dragHandle?: string;
  width?: number;
  height?: number;
  initialWidth?: number;
  initialHeight?: number;
  /** Parent node id, used for creating sub-flows */
  parentId?: string;
  zIndex?: number;
  /** Boundary a node can be moved in
   * @example 'parent' or [[0, 0], [100, 100]]
   */
  extent?: 'parent' | CoordinateExtent;
  expandParent?: boolean;
  ariaLabel?: string;
  /** Origin of the node relative to it's position
   * @example
   * [0.5, 0.5] // centers the node
   * [0, 0] // top left
   * [1, 1] // bottom right
   */
  measured?: {
    width?: number;
    height?: number;
  };
};
export declare enum Position {
  Left = "left",
  Top = "top",
  Right = "right",
  Bottom = "bottom"
}
export declare const oppositePosition: {
  left: Position;
  right: Position;
  top: Position;
  bottom: Position;
};
export type XYPosition = {
  x: number;
  y: number;
};
export type XYZPosition = XYPosition & {
  z: number;
};
export type Dimensions = {
  width: number;
  height: number;
};
export type Rect = Dimensions & XYPosition;
export type Box = XYPosition & {
  x2: number;
  y2: number;
};
export type Transform = [number, number, number];
export type CoordinateExtent = [[number, number], [number, number]];
//# sourceMappingURL=utils.d.ts.m

export type NodeDimensionChange = {
  id: string;
  type: 'dimensions';
  dimensions?: Dimensions;
  resizing?: boolean;
  setAttributes?: boolean;
};
export type NodePositionChange = {
  id: string;
  type: 'position';
  position?: XYPosition;
  positionAbsolute?: XYPosition;
  dragging?: boolean;
};
export type NodeSelectionChange = {
  id: string;
  type: 'select';
  selected: boolean;
};
export type NodeRemoveChange = {
  id: string;
  type: 'remove';
};
export type NodeAddChange<NodeType extends NodeBase = NodeBase> = {
  item: NodeType;
  type: 'add';
  index?: number;
};
export type NodeReplaceChange<NodeType extends NodeBase = NodeBase> = {
  id: string;
  item: NodeType;
  type: 'replace';
};
/**
 * Union type of all possible node changes.
 * @public
 */
export type NodeChange<NodeType extends NodeBase = NodeBase> = NodeDimensionChange | NodePositionChange | NodeSelectionChange | NodeRemoveChange | NodeAddChange<NodeType> | NodeReplaceChange<NodeType>;
export type EdgeSelectionChange = NodeSelectionChange;
export type EdgeRemoveChange = NodeRemoveChange;
export type EdgeAddChange<EdgeType extends EdgeBase = EdgeBase> = {
  item: EdgeType;
  type: 'add';
  index?: number;
};
export type EdgeReplaceChange<EdgeType extends EdgeBase = EdgeBase> = {
  id: string;
  item: EdgeType;
  type: 'replace';
};
export type EdgeChange<EdgeType extends EdgeBase = EdgeBase> = EdgeSelectionChange | EdgeRemoveChange | EdgeAddChange<EdgeType> | EdgeReplaceChange<EdgeType>;
//# sourceMappingURL=changes.d.ts.map

export interface EntityColumn {
  entityId: string;
  id: string;
  name: string;
  primary: boolean;
  type: string;
  foreignKey: boolean;
  notNull: boolean;
  unique: boolean;
  unsigned: boolean;
  autoIncrement: boolean;
  comment: string;
  order: number;
  selected: boolean;
}

export type EntityData = {
  name: string
  color: string
  columns: EntityColumn[]
}

export type EntityNode = NodeBase<EntityData, NODE_TYPES.ENTITY>

export type NodeTypes = {
  entity: EntityNode
  memo: MemoNode
}

type MemoData = {
  content: string
  color: string
}

export type MemoNode = NodeBase<MemoData, NODE_TYPES.MEMO>

export type NodeType = EntityNode | MemoNode

export type EdgeType = EdgeBase

export type EntityConfig =  EntityNode['data'] & {
  userId: string
}

// This function applies changes to nodes or edges that are triggered by React Flow internally.
// When you drag a node for example, React Flow will send a position change update.
// This function then applies the changes and returns the updated elements.
function applyChanges(changes: any[], elements: any[]): any[] {
  const updatedElements: any[] = [];
  // By storing a map of changes for each element, we can a quick lookup as we
  // iterate over the elements array!
  const changesMap = new Map<any, any[]>();
  const addItemChanges: any[] = [];

  for (const change of changes) {
    if (change.type === 'add') {
      addItemChanges.push(change);
      continue;
    } else if (change.type === 'remove' || change.type === 'replace') {
      // For a 'remove' change we can safely ignore any other changes queued for
      // the same element, it's going to be removed anyway!
      changesMap.set(change.id, [change]);
    } else {
      const elementChanges = changesMap.get(change.id);

      if (elementChanges) {
        // If we have some changes queued already, we can do a mutable update of
        // that array and save ourselves some copying.
        elementChanges.push(change);
      } else {
        changesMap.set(change.id, [change]);
      }
    }
  }

  for (const element of elements) {
    const changes = changesMap.get(element.id);

    // When there are no changes for an element we can just push it unmodified,
    // no need to copy it.
    if (!changes) {
      updatedElements.push(element);
      continue;
    }

    // If we have a 'remove' change queued, it'll be the only change in the array
    if (changes[0].type === 'remove') {
      continue;
    }

    if (changes[0].type === 'replace') {
      updatedElements.push({ ...changes[0].item });
      continue;
    }

    // For other types of changes, we want to start with a shallow copy of the
    // object so React knows this element has changed. Sequential changes will
    /// each _mutate_ this object, so there's only ever one copy.
    const updatedElement = { ...element };

    for (const change of changes) {
      applyChange(change, updatedElement);
    }

    updatedElements.push(updatedElement);
  }

  // we need to wait for all changes to be applied before adding new items
  // to be able to add them at the correct index
  if (addItemChanges.length) {
    addItemChanges.forEach((change) => {
      if (change.index !== undefined) {
        updatedElements.splice(change.index, 0, { ...change.item });
      } else {
        updatedElements.push({ ...change.item });
      }
    });
  }

  return updatedElements;
}

// Applies a single change to an element. This is a *mutable* update.
function applyChange(change: any, element: any): any {
  switch (change.type) {
    case 'select': {
      element.selected = change.selected;
      break;
    }

    case 'position': {
      if (typeof change.position !== 'undefined') {
        element.position = change.position;
      }

      if (typeof change.dragging !== 'undefined') {
        element.dragging = change.dragging;
      }

      break;
    }

    case 'dimensions': {
      if (typeof change.dimensions !== 'undefined') {
        element.measured ??= {};
        element.measured.width = change.dimensions.width;
        element.measured.height = change.dimensions.height;

        if (change.setAttributes) {
          element.width = change.dimensions.width;
          element.height = change.dimensions.height;
        }
      }

      if (typeof change.resizing === 'boolean') {
        element.resizing = change.resizing;
      }

      break;
    }
  }
}

/**
 * Drop in function that applies node changes to an array of nodes.
 * @public
 * @remarks Various events on the <ReactFlow /> component can produce an {@link NodeChange} that describes how to update the edges of your flow in some way.
 If you don't need any custom behaviour, this util can be used to take an array of these changes and apply them to your edges.
 * @param changes - Array of changes to apply
 * @param nodes - Array of nodes to apply the changes to
 * @returns Array of updated nodes
 * @example
 *  const onNodesChange = useCallback(
 (changes) => {
 setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
 },
 [setNodes],
 );

 return (
 <ReactFLow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
 );
 */
export function applyNodeChanges<N extends NodeBase = NodeBase>(
  changes: NodeChange<NodeType>[],
  nodes: N[]
): N[] {
  return applyChanges(changes, nodes) as N[];
}

/**
 * Drop in function that applies edge changes to an array of edges.
 * @public
 * @remarks Various events on the <ReactFlow /> component can produce an {@link EdgeChange} that describes how to update the edges of your flow in some way.
 If you don't need any custom behaviour, this util can be used to take an array of these changes and apply them to your edges.
 * @param changes - Array of changes to apply
 * @param edges - Array of edge to apply the changes to
 * @returns Array of updated edges
 * @example
 *  const onEdgesChange = useCallback(
 (changes) => {
 setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
 },
 [setEdges],
 );

 return (
 <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
 );
 */
export function applyEdgeChanges<EdgeType extends EdgeBase = EdgeBase>(
  changes: EdgeChange<EdgeType>[],
  edges: EdgeType[]
): EdgeType[] {
  return applyChanges(changes, edges) as EdgeType[];
}

export function createSelectionChange(id: string, selected: boolean): NodeSelectionChange | EdgeSelectionChange {
  return {
    id,
    type: 'select',
    selected,
  };
}

export function getSelectionChanges(
  items: Map<string, any>,
  selectedIds: Set<string> = new Set(),
  mutateItem = false
): NodeSelectionChange[] | EdgeSelectionChange[] {
  const changes: NodeSelectionChange[] | EdgeSelectionChange[] = [];

  for (const [id, item] of items) {
    const willBeSelected = selectedIds.has(id);

    // we don't want to set all items to selected=false on the first selection
    if (!(item.selected === undefined && !willBeSelected) && item.selected !== willBeSelected) {
      if (mutateItem) {
        // this hack is needed for nodes. When the user dragged a node, it's selected.
        // When another node gets dragged, we need to deselect the previous one,
        // in order to have only one selected node at a time - the onNodesChange callback comes too late here :/
        item.selected = willBeSelected;
      }
      changes.push(createSelectionChange(item.id, willBeSelected));
    }
  }

  return changes;
}

/**
 * This function is used to find the changes between two sets of elements.
 * It is used to determine which nodes or edges have been added, removed or replaced.
 *
 * @internal
 * @param params.items = the next set of elements (nodes or edges)
 * @param params.lookup = a lookup map of the current store elements
 * @returns an array of changes
 */
export function getElementsDiffChanges({
                                         items,
                                         lookup,
                                       }: {
  items: Node[] | undefined;
  lookup: any
}): NodeChange[];
export function getElementsDiffChanges({
                                         items,
                                         lookup,
                                       }: {
  items: EdgeBase[] | undefined;
  lookup: any;
}): EdgeChange[];
export function getElementsDiffChanges({
                                         items = [],
                                         lookup,
                                       }: {
  items: any[] | undefined;
  lookup: Map<string, any>;
}): any[] {
  const changes: any[] = [];
  const itemsLookup = new Map<string, any>(items.map((item) => [item.id, item]));

  for (const [index, item] of items.entries()) {
    const lookupItem = lookup.get(item.id);
    const storeItem = lookupItem?.internals?.userNode ?? lookupItem;

    if (storeItem !== undefined && storeItem !== item) {
      changes.push({ id: item.id, item: item, type: 'replace' });
    }

    if (storeItem === undefined) {
      changes.push({ item: item, type: 'add', index });
    }
  }

  for (const [id] of lookup) {
    const nextNode = itemsLookup.get(id);

    if (nextNode === undefined) {
      changes.push({ id, type: 'remove' });
    }
  }

  return changes;
}

export function elementToRemoveChange<T extends NodeBase | EdgeBase>(item: T): NodeRemoveChange | EdgeRemoveChange {
  return {
    id: item.id,
    type: 'remove',
  };
}
