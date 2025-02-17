<template>
  <ul
    class="tree-root"
  >
    <HierarchicalTreeNode
      v-for="nodeId in renderedNodeIds"
      :key="nodeId"
      :nodeId="nodeId"
      :treeRoot="treeRoot"
      :renderingStrategy="renderingStrategy"
    >
      <template v-slot:node-content="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </HierarchicalTreeNode>
  </ul>
</template>

<script lang="ts">
import {
  defineComponent, computed, PropType,
} from 'vue';
import HierarchicalTreeNode from '../Node/HierarchicalTreeNode.vue';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { NodeRenderingStrategy } from '../Rendering/Scheduling/NodeRenderingStrategy';
import { TreeRoot } from './TreeRoot';

export default defineComponent({
  components: {
    HierarchicalTreeNode,
  },
  props: {
    treeRoot: {
      type: Object as PropType<TreeRoot>,
      required: true,
    },
    renderingStrategy: {
      type: Object as PropType<NodeRenderingStrategy>,
      required: true,
    },
  },
  setup(props) {
    const { nodes } = useCurrentTreeNodes(() => props.treeRoot);

    const renderedNodeIds = computed<string[]>(() => {
      return nodes
        .value
        .rootNodes
        .filter((node) => props.renderingStrategy.shouldRender(node))
        .map((node) => node.id);
    });

    return {
      renderedNodeIds,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.tree-root {
  @include reset-ul;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 3px;
}
</style>
