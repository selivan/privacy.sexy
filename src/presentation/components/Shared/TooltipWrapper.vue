<template>
  <div class="tooltip">
    <div
      class="tooltip__trigger"
      ref="triggeringElement">
      <slot />
    </div>
    <div
      class="tooltip__display"
      ref="tooltipDisplayElement"
      :style="displayStyles"
    >
      <div class="tooltip__content">
        <slot name="tooltip" />
      </div>
      <div
        ref="arrowElement"
        class="tooltip__arrow"
        :style="arrowStyles"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  useFloating, arrow, shift, flip, Placement, offset, Side, Coords,
} from '@floating-ui/vue';
import { defineComponent, ref, computed } from 'vue';
import type { CSSProperties } from 'vue/types/jsx'; // In Vue 3.0 import from 'vue'

const GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX = 2;
const ARROW_SIZE_IN_PX = 4;
const MARGIN_FROM_DOCUMENT_EDGE_IN_PX = 2;

export default defineComponent({
  setup() {
    const tooltipDisplayElement = ref<HTMLElement | undefined>();
    const triggeringElement = ref<HTMLElement | undefined>();
    const arrowElement = ref<HTMLElement | undefined>();
    const placement = ref<Placement>('top');

    const { floatingStyles, middlewareData } = useFloating(
      triggeringElement,
      tooltipDisplayElement,
      {
        placement: ref(placement),
        middleware: [
          offset(ARROW_SIZE_IN_PX + GAP_BETWEEN_TOOLTIP_AND_TRIGGER_IN_PX),
          /* Shifts the element along the specified axes in order to keep it in view. */
          shift({
            padding: MARGIN_FROM_DOCUMENT_EDGE_IN_PX,
          }),
          /*  Changes the placement of the floating element in order to keep it in view,
              with the ability to flip to any placement. */
          flip(),
          arrow({ element: arrowElement }),
        ],
      },
    );
    const arrowStyles = computed<CSSProperties>(() => {
      if (!middlewareData.value.arrow) {
        return {
          display: 'none',
        };
      }
      return {
        ...getArrowPositionStyles(middlewareData.value.arrow, placement.value),
        ...getArrowAppearanceStyles(),
      };
    });

    return {
      tooltipDisplayElement,
      triggeringElement,
      displayStyles: floatingStyles,
      arrowStyles,
      arrowElement,
      placement,
    };
  },
});

function getArrowAppearanceStyles(): CSSProperties {
  return {
    width: `${ARROW_SIZE_IN_PX * 2}px`,
    height: `${ARROW_SIZE_IN_PX * 2}px`,
    rotate: '45deg',
  };
}

function getArrowPositionStyles(
  coordinations: Partial<Coords>,
  placement: Placement,
): CSSProperties {
  const style: CSSProperties = {};
  style.position = 'absolute';
  const { x, y } = coordinations;
  if (x) {
    style.left = `${x}px`;
  } else if (y) { // either X or Y is calculated
    style.top = `${y}px`;
  }
  const oppositeSide = getCounterpartBoxOffsetProperty(placement) as never;
  // Cast to `never` due to ts(2590) from JSX import. Remove after migrating to Vue 3.0.
  style[oppositeSide] = `-${ARROW_SIZE_IN_PX}px`;
  return style;
}

function getCounterpartBoxOffsetProperty(placement: Placement): keyof CSSProperties {
  const sideCounterparts: Record<Side, keyof CSSProperties> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  };
  const currentSide = placement.split('-')[0] as Side;
  return sideCounterparts[currentSide];
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$color-tooltip-background: $color-primary-darkest;

@mixin set-visibility($isVisible: true) {
  @if $isVisible {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  } @else {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }
}

.tooltip {
  display: inline-flex;
}

.tooltip__display {
  @include set-visibility(false);
}

.tooltip__trigger {
  @include hover-or-touch {
    + .tooltip__display {
      @include set-visibility(true);
      z-index: 10000;
    }
  }
}

.tooltip__content {
  background: $color-tooltip-background;
  color: $color-on-primary;
  border-radius: 16px;
  padding: 5px 10px 4px;
}

.tooltip__arrow {
  background: $color-tooltip-background;
}
</style>
