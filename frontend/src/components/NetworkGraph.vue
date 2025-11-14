<template>
  <div class="network-graph-container" :class="{ 'h-full': hideControls }">
    <div v-if="!hideControls" class="graph-controls mb-3 md:mb-4 flex justify-center gap-3 md:gap-4">
      <button @click="zoomIn" class="btn-primary px-4 py-2 md:px-5 md:py-2.5">
        🔍+ Acercar
      </button>
      <button @click="zoomOut" class="btn-primary px-4 py-2 md:px-5 md:py-2.5">
        🔍- Alejar
      </button>
      <button @click="centerGraph" class="btn-success px-4 py-2 md:px-5 md:py-2.5">
        🎯 Acomodar Grafo
      </button>
    </div>

    <div class="graph-wrapper bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-auto"
         :class="{ 'h-full': hideControls }"
         ref="graphWrapper"
         @wheel="handleWheel">
      <svg ref="svgRef" class="network-graph"></svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  graphData: {
    type: Object,
    required: true
  },
  hideControls: {
    type: Boolean,
    default: false
  }
})

const svgRef = ref(null)
const graphWrapper = ref(null)
const currentZoom = ref(1)
const markerId = ref(`arrow-${Math.random().toString(36).substr(2, 9)}`)

let svg, g, simulation, zoomBehavior

// Tipos de nodos permitidos con sus emojis y colores
const nodeTypes = {
  person: {
    emoji: '🧑',
    color: '#2563eb', // Blue 600
    label: 'Persona'
  },
  phone: {
    emoji: '📱',
    color: '#059669', // Green 600
    label: 'Teléfono'
  },
  email: {
    emoji: '📧',
    color: '#dc2626', // Red 600
    label: 'Correo'
  },
  id: {
    emoji: '🆔',
    color: '#7c3aed', // Purple 600
    label: 'Documento'
  },
  device: {
    emoji: '💻',
    color: '#db2777', // Pink 600
    label: 'Dispositivo'
  },
  location: {
    emoji: '📍',
    color: '#0891b2', // Cyan 600
    label: 'Ubicación'
  },
  address: {
    emoji: '🏠',
    color: '#ea580c', // Orange 600
    label: 'Dirección'
  },
  company: {
    emoji: '🏢',
    color: '#4f46e5', // Indigo 600
    label: 'Empresa'
  },
  bank: {
    emoji: '🏦',
    color: '#059669', // Green 600
    label: 'Banco'
  },
  card: {
    emoji: '💳',
    color: '#0284c7', // Sky 600
    label: 'Tarjeta'
  },
  transaction: {
    emoji: '💰',
    color: '#ca8a04', // Yellow 600
    label: 'Transacción'
  },
  ip: {
    emoji: '🌐',
    color: '#0891b2', // Cyan 600
    label: 'IP'
  }
}

const initGraph = () => {
  if (!svgRef.value || !props.graphData || !props.graphData.nodes || !props.graphData.links) {
    console.error('Invalid graph data or SVG ref not available')
    return
  }

  const width = 900
  const height = 700

  // Clear previous content
  d3.select(svgRef.value).selectAll('*').remove()

  svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  g = svg.append('g')

  // Clone data to avoid mutation
  const nodes = JSON.parse(JSON.stringify(props.graphData.nodes))
  const links = JSON.parse(JSON.stringify(props.graphData.links))

  // Create arrow markers for links (dynamic positioning with unique ID)
  svg.append('defs').selectAll('marker')
    .data([markerId.value])
    .join('marker')
    .attr('id', d => d)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 8)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', '#8b5cf6')
    .attr('d', 'M0,-5L10,0L0,5')

  // Create links with gradient effect
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#8b5cf6')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.max(2, Math.sqrt((d.strength || 1) * 6)))
    .attr('marker-end', `url(#${markerId.value})`)

  // Link labels removed - percentages not used

  // Create nodes with drag behavior
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node')
    .style('cursor', 'grab')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

  // Add circles to nodes (person nodes bigger)
  node.append('circle')
    .attr('r', d => d.type === 'person' ? 45 : 35)  // Person nodes más grandes
    .attr('fill', d => d.type === 'person'
      ? nodeTypes[d.type]?.color || '#6b7280'  // Person con fondo sólido
      : 'transparent')  // Otros con fondo transparente
    .attr('stroke', d => nodeTypes[d.type]?.color || '#6b7280')
    .attr('stroke-width', d => d.type === 'person' ? 3 : 4)  // Borde más grueso para no-person
    .attr('stroke-opacity', d => d.type === 'person' ? 0.5 : 1)  // Borde completamente opaco para no-person
    .style('filter', 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4))')

  // Add emoji inside the circle (bigger for person)
  // Soporta emoji personalizado en el nodo o usa el del tipo
  node.append('text')
    .text(d => d.emoji || nodeTypes[d.type]?.emoji || '❓')
    .attr('x', 0)
    .attr('y', 0)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', d => d.type === 'person' ? '36px' : '28px')  // Emoji más grande para person
    .style('pointer-events', 'none')

  // Add main label below node (adjust position for bigger person nodes)
  node.append('text')
    .text(d => d.label)
    .attr('x', 0)
    .attr('y', d => d.type === 'person' ? 60 : 50)  // Más abajo para person
    .attr('text-anchor', 'middle')
    .attr('font-size', d => d.type === 'person' ? '16px' : '14px')  // Texto más grande para person
    .attr('font-weight', '600')
    .attr('fill', '#1e293b')
    .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)')

  // Add type label (gray text, adjust position)
  node.append('text')
    .text(d => nodeTypes[d.type]?.label || d.type)
    .attr('x', 0)
    .attr('y', d => d.type === 'person' ? 78 : 66)  // Más abajo para person
    .attr('text-anchor', 'middle')
    .attr('font-size', '12px')
    .attr('fill', '#64748b')
    .style('text-shadow', '1px 1px 2px rgba(255,255,255,0.8)')

  // Create static force simulation (adjusted for larger person nodes)
  simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links)
      .id(d => d.id)
      .distance(220))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.type === 'person' ? 90 : 80))

  // Helper function to get node radius
  const getNodeRadius = (node) => node.type === 'person' ? 45 : 35

  // Helper function to calculate link endpoints at circle borders
  const getLinkEndpoints = (d) => {
    const dx = d.target.x - d.source.x
    const dy = d.target.y - d.source.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance === 0) return { x1: d.source.x, y1: d.source.y, x2: d.target.x, y2: d.target.y }

    const sourceRadius = getNodeRadius(d.source)
    const targetRadius = getNodeRadius(d.target)

    // Calculate unit vector
    const ux = dx / distance
    const uy = dy / distance

    // Start point: edge of source circle
    const x1 = d.source.x + ux * sourceRadius
    const y1 = d.source.y + uy * sourceRadius

    // End point: edge of target circle (minus arrow size)
    const x2 = d.target.x - ux * (targetRadius + 5)
    const y2 = d.target.y - uy * (targetRadius + 5)

    return { x1, y1, x2, y2 }
  }

  // Run simulation to compute positions
  simulation.on('tick', () => {
    link.each(function(d) {
      const endpoints = getLinkEndpoints(d)
      d3.select(this)
        .attr('x1', endpoints.x1)
        .attr('y1', endpoints.y1)
        .attr('x2', endpoints.x2)
        .attr('y2', endpoints.y2)
    })

    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
    d3.select(this).style('cursor', 'grabbing')
  }

  function dragged(event, d) {
    d.fx = event.x
    d.fy = event.y
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
    d3.select(this).style('cursor', 'grab')
  }

  // Keep simulation running for drag interactions
  simulation.alpha(1).restart()

  // Add zoom behavior
  zoomBehavior = d3.zoom()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
      currentZoom.value = event.transform.k
    })

  svg.call(zoomBehavior)

  // Center graph after simulation stabilizes
  setTimeout(() => {
    centerGraph()
  }, 3500)
}

const zoomIn = () => {
  if (!svg || !zoomBehavior) return
  svg.transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 1.3)
}

const zoomOut = () => {
  if (!svg || !zoomBehavior) return
  svg.transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 0.7)
}

const centerGraph = () => {
  if (!svg || !zoomBehavior || !g) return

  // Get the bounding box of all elements
  try {
    const bounds = g.node().getBBox()
    const width = 900
    const height = 700

    // Calculate the scale to fit all nodes
    const fullWidth = bounds.width
    const fullHeight = bounds.height
    const midX = bounds.x + fullWidth / 2
    const midY = bounds.y + fullHeight / 2

    // Calculate scale to fit (with some padding)
    const scale = 0.85 / Math.max(fullWidth / width, fullHeight / height)

    // Calculate translation to center
    const translate = [
      width / 2 - scale * midX,
      height / 2 - scale * midY
    ]

    // Apply the transform with animation
    svg.transition()
      .duration(750)
      .call(
        zoomBehavior.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      )
  } catch (error) {
    // Fallback to simple reset if getBBox fails
    svg.transition()
      .duration(500)
      .call(zoomBehavior.transform, d3.zoomIdentity)
  }
}

const handleWheel = (event) => {
  event.preventDefault()
}

onMounted(() => {
  initGraph()
})

watch(() => props.graphData, () => {
  initGraph()
}, { deep: true })

// Expose methods for parent component to call
defineExpose({
  zoomIn,
  zoomOut,
  centerGraph
})
</script>

<style scoped>
.network-graph-container {
  width: 100%;
}

.graph-wrapper {
  width: 100%;
  height: 450px;
  position: relative;
  touch-action: pan-x pan-y;
}

/* When hideControls is true (tutorial mode), use full container height */
.network-graph-container:has(.graph-controls:not(:empty)) .graph-wrapper {
  height: 450px;
}

.network-graph-container:not(:has(.graph-controls:not(:empty))) .graph-wrapper {
  height: 100%;
}

.network-graph {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 768px) {
  .graph-wrapper {
    height: 350px; /* Reducido para dejar espacio a la pregunta */
  }

  .network-graph-container:not(:has(.graph-controls:not(:empty))) .graph-wrapper {
    height: 100%;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .graph-wrapper {
    height: 400px;
  }
}

/* Hacer los botones más visibles y táctiles */
.graph-controls button {
  font-weight: 600;
  min-width: auto;
}

@media (max-width: 640px) {
  .graph-controls button {
    font-size: 14px;
  }
}
</style>

