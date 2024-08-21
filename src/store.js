import create from 'zustand';

const useStore = create((set) => ({
  nodes: [],
  edges: [],
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodeColor: (id, color) =>
    set((state) => {
      const nodes = state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, color } } : node
      );
      return { nodes };
    }),
}));

export default useStore;
