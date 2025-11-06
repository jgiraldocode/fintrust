<template>
  <div class="network-graph-container">
    <div class="graph-controls mb-4 flex justify-center gap-4">
      <button @click="zoomIn" class="btn-secondary">
        🔍+ Zoom In
      </button>
      <button @click="zoomOut" class="btn-secondary">
        🔍- Zoom Out
      </button>
      <button @click="resetZoom" class="btn-secondary">
        ↻ Reset
      </button>
    </div>

    <div class="graph-wrapper bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-auto"
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
  }
})

const svgRef = ref(null)
const graphWrapper = ref(null)
const currentZoom = ref(1)

let svg, g, simulation

const nodeColors = {
  person: '#3b82f6',
  phone: '#10b981',
  email: '#f59e0b',
  id: '#8b5cf6',
  device: '#ec4899',
  location: '#14b8a6'
}

const initGraph = () => {
  if (!svgRef.value) return

  const width = 800
  const height = 600

  // Clear previous content
  d3.select(svgRef.value).selectAll('*').remove()

  svg = d3.select(svgRef.value)
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  g = svg.append('g')

  // Create arrow markers for links
  svg.append('defs').selectAll('marker')
    .data(['end'])
    .join('marker')
    .attr('id', d => d)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 25)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('fill', '#999')
    .attr('d', 'M0,-5L10,0L0,5')

  // Create links
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(props.graphData.links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.strength * 5) || 2)
    .attr('marker-end', 'url(#end)')

  // Create nodes
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(props.graphData.nodes)
    .join('g')
    .attr('class', 'node')
    .style('cursor', 'pointer')

  // Add circles to nodes
  node.append('circle')
    .attr('r', 20)
    .attr('fill', d => nodeColors[d.type] || '#6b7280')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)

  // Add labels to nodes
  node.append('text')
    .text(d => d.label)
    .attr('x', 0)
    .attr('y', 35)
    .attr('text-anchor', 'middle')
    .attr('font-size', '14px')
    .attr('font-weight', 'bold')
    .attr('fill', '#374151')

  // Add type label
  node.append('text')
    .text(d => d.type)
    .attr('x', 0)
    .attr('y', 50)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#6b7280')

  // Create static force simulation
  simulation = d3.forceSimulation(props.graphData.nodes)
    .force('link', d3.forceLink(props.graphData.links)
      .id(d => d.id)
      .distance(150))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50))

  // Run simulation to compute positions
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })

  // Stop simulation after positions stabilize
  simulation.alpha(1).restart()
  setTimeout(() => {
    simulation.stop()
  }, 3000)

  // Add zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.5, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
      currentZoom.value = event.transform.k
    })

  svg.call(zoom)
}

const zoomIn = () => {
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom().scaleBy,
    1.3
  )
}

const zoomOut = () => {
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom().scaleBy,
    0.7
  )
}

const resetZoom = () => {
  const svg = d3.select(svgRef.value)
  svg.transition().call(
    d3.zoom().transform,
    d3.zoomIdentity
  )
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
</script>

<style scoped>
.network-graph-container {
  width: 100%;
}

.graph-wrapper {
  width: 100%;
  height: 500px;
  position: relative;
  touch-action: pan-x pan-y;
}

.network-graph {
  width: 100%;
  height: 100%;
  display: block;
}

@media (max-width: 768px) {
  .graph-wrapper {
    height: 400px;
  }
}
</style>

