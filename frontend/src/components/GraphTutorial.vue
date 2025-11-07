<template>
  <div v-if="showTutorial" class="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
    <!-- Main content - 3 sections layout -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Section 1: Graph Controls - Fixed height -->
      <div class="flex-shrink-0 p-2 md:p-3 bg-gray-100 border-b border-gray-200">
        <div class="flex items-center justify-center gap-2 md:gap-3">
          <button @click="handleZoomIn" class="btn-primary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            🔍+ Acercar
          </button>
          <button @click="handleZoomOut" class="btn-primary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            🔍- Alejar
          </button>
          <button @click="handleCenterGraph" class="btn-success px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
            🎯 Acomodar
          </button>
        </div>
      </div>

      <!-- Section 2: Graph Area - Takes remaining space between controls and tutorial -->
      <div class="flex-1 min-h-0 p-2 md:p-3 overflow-hidden bg-gray-50">
        <div class="h-full w-full">
          <NetworkGraph
            ref="graphComponent"
            :graph-data="exampleGraph"
            :hide-controls="true"
          />
        </div>
      </div>

      <!-- Section 3: Tutorial Panel - Fixed height at bottom -->
      <div class="flex-shrink-0 bg-white border-t-2 border-gray-200 shadow-2xl" :style="{ height: tutorialHeight }">
        <div class="p-2 md:p-3 flex flex-col h-full overflow-hidden">
          <!-- Header with Step Title and Skip Button -->
          <div class="mb-2 md:mb-3 flex-shrink-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <div
                  class="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                  :class="tutorialSteps[currentStep].bgColor"
                  :style="{ animation: tutorialSteps[currentStep].animation }"
                >
                  <span class="text-xl md:text-2xl">{{ tutorialSteps[currentStep].icon }}</span>
                </div>
                <h2 class="text-base md:text-lg font-bold text-gray-900 leading-snug">
                  {{ tutorialSteps[currentStep].title }}
                </h2>
              </div>
              <button
                @click="skipTutorial"
                class="btn-secondary px-2 py-1 text-xs flex-shrink-0"
              >
                ⏭️ Saltar
              </button>
            </div>
          </div>

          <!-- Current Step Content - NO SCROLL -->
          <div class="flex-1 mb-1.5 min-h-0 overflow-hidden flex flex-col">
            <div
              class="p-2 md:p-3 rounded-lg border-2 flex-shrink-0"
              :class="tutorialSteps[currentStep].borderColor"
            >
              <p class="text-sm md:text-base text-gray-700 leading-relaxed">
                {{ tutorialSteps[currentStep].description }}
              </p>

              <div
                v-if="tutorialSteps[currentStep].action"
                class="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200"
              >
                <p class="text-sm font-semibold text-yellow-900">
                  🎯 ¡Inténtalo ahora!
                </p>
              </div>
            </div>
          </div>

          <!-- Progress indicator with step counter above -->
          <div class="flex flex-col items-center gap-1 mb-1.5 flex-shrink-0">
            <span class="text-xs text-gray-600 font-medium">
              {{ currentStep + 1 }}/{{ tutorialSteps.length }}
            </span>
            <div class="flex justify-center gap-1">
              <div
                v-for="i in tutorialSteps.length"
                :key="i"
                class="h-1 rounded-full transition-all duration-300"
                :class="i - 1 === currentStep ? 'w-6 bg-primary-600' : i - 1 < currentStep ? 'w-4 bg-primary-400' : 'w-1 bg-gray-300'"
              ></div>
            </div>
          </div>

          <!-- Navigation - Super Compact -->
          <div class="flex gap-1.5 flex-shrink-0">
            <button
              v-if="currentStep > 0"
              @click="previousStep"
              class="btn-secondary flex-1 py-1.5 text-xs"
            >
              ←
            </button>

            <button
              v-if="currentStep < tutorialSteps.length - 1"
              @click="nextStep"
              class="btn-primary flex-1 py-1.5 text-xs"
            >
              Siguiente →
            </button>

            <button
              v-else
              @click="startQuiz"
              class="btn-success flex-1 py-1.5 font-bold text-xs"
            >
              ¡Comenzar! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import NetworkGraph from './NetworkGraph.vue'

const emit = defineEmits(['close'])

const showTutorial = ref(true)
const currentStep = ref(0)
const graphComponent = ref(null)

// Calculate tutorial panel height - increased for better readability
const tutorialHeight = computed(() => {
  if (typeof window !== 'undefined') {
    const vh = window.innerHeight
    // Tutorial takes more space for better readability
    if (window.innerWidth < 640) {
      return `${vh * 0.42}px` // 42% on small mobile
    } else if (window.innerWidth < 1024) {
      return `${vh * 0.45}px` // 45% on tablet
    }
    return `${vh * 0.48}px` // 48% on desktop
  }
  return '42vh'
})

// Methods to control the graph from external buttons
const handleZoomIn = () => {
  if (graphComponent.value && graphComponent.value.zoomIn) {
    graphComponent.value.zoomIn()
  }
}

const handleZoomOut = () => {
  if (graphComponent.value && graphComponent.value.zoomOut) {
    graphComponent.value.zoomOut()
  }
}

const handleCenterGraph = () => {
  if (graphComponent.value && graphComponent.value.centerGraph) {
    graphComponent.value.centerGraph()
  }
}

// Example graph for tutorial
const exampleGraph = {
  nodes: [
    { id: 'p1', label: 'Ana García', type: 'person' },
    { id: 'p2', label: 'Carlos López', type: 'person' },
    { id: 'tel1', label: '+57 300-1234', type: 'phone' },
    { id: 'tel2', label: '+57 311-5678', type: 'phone' },
    { id: 'email1', label: 'ana@mail.com', type: 'email' },
    { id: 'doc1', label: 'CC-123456', type: 'id' }
  ],
  links: [
    { source: 'p1', target: 'tel1', strength: 0.95 },
    { source: 'p1', target: 'email1', strength: 0.90 },
    { source: 'p1', target: 'doc1', strength: 1.0 },
    { source: 'p2', target: 'tel2', strength: 0.88 },
    { source: 'p1', target: 'tel2', strength: 0.65 }
  ]
}

// Tutorial steps
const tutorialSteps = [
  {
    icon: '📊',
    title: 'Grafo de Práctica',
    description: 'Este es un grafo de muestra diseñado para que aprendas a manipular e interactuar con los grafos. Practicarás aquí antes de comenzar el quiz. Los grafos muestran relaciones entre personas y elementos como teléfonos, emails y documentos.',
    bgColor: 'bg-indigo-500',
    borderColor: 'border-indigo-300 bg-indigo-50',
    animation: 'pulse 2s infinite'
  },
  {
    icon: '👋',
    title: 'Elementos del Grafo',
    description: 'Los círculos azules representan personas, y los otros círculos representan diferentes tipos de información (teléfonos 📱, emails 📧, documentos 🆔). Las líneas conectan elementos relacionados.',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-300 bg-blue-50',
    animation: 'pulse 2s infinite'
  },
  {
    icon: '🔍+',
    title: 'Acercar',
    description: 'Usa el botón "🔍+ Acercar" o haz el gesto de pellizcar con dos dedos (abrir) sobre el grafo para acercarte. Esto te ayudará a leer mejor las etiquetas y ver las conexiones entre elementos.',
    action: 'Prueba hacer clic en el botón "Acercar" arriba del grafo',
    bgColor: 'bg-primary-500',
    borderColor: 'border-primary-300 bg-primary-50',
    animation: 'pulse 2s infinite'
  },
  {
    icon: '🔍-',
    title: 'Alejar',
    description: 'Usa el botón "🔍- Alejar" o haz el gesto de pellizcar con dos dedos (cerrar) sobre el grafo para alejarte. Esto es útil cuando hay muchos nodos y quieres ver todas las conexiones.',
    action: 'Prueba hacer clic en el botón "Alejar"',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-300 bg-purple-50',
    animation: 'pulse 3s infinite'
  },
  {
    icon: '👆',
    title: 'Mover Nodos',
    description: 'Puedes tocar y arrastrar cualquier círculo para reorganizar el grafo. Esto te ayuda a ver mejor las conexiones entre diferentes elementos.',
    action: 'Arrastra uno de los círculos azules para moverlo',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-300 bg-green-50',
    animation: 'bounce-gentle 2s infinite'
  },
  {
    icon: '🎯',
    title: 'Acomodar Grafo',
    description: 'Si el grafo se desorganiza o no es visible en la pantalla, haz clic en "🎯 Acomodar Grafo" para centrarlo y ajustarlo perfectamente. ¡Muy útil!',
    action: 'Prueba hacer clic en "Acomodar Grafo"',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-300 bg-orange-50',
    animation: 'spin-slow 4s infinite linear'
  },
  {
    icon: '🎓',
    title: '¡Listo para Comenzar!',
    description: 'Ahora ya sabes cómo interactuar con el grafo. En el quiz, verás grafos similares y deberás responder preguntas sobre las conexiones entre los elementos. ¡Buena suerte!',
    bgColor: 'bg-green-600',
    borderColor: 'border-green-300 bg-green-50',
    animation: 'pulse 2s infinite'
  }
]

onMounted(() => {
  // Tutorial always shows - no localStorage check
})

const nextStep = () => {
  if (currentStep.value < tutorialSteps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const skipTutorial = () => {
  showTutorial.value = false
  emit('close')
}

const startQuiz = () => {
  showTutorial.value = false
  emit('close')
}
</script>

<style scoped>
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

