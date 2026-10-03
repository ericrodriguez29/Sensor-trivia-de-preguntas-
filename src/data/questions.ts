import { Question, Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'Desafío Mixto Total',
    icon: 'Sparkles',
    color: 'from-cyan-500 to-blue-600',
    description: 'Preguntas variadas de todas las disciplinas deportivas y salud'
  },
  {
    id: 'sports_rules',
    name: 'Reglas y Deportes de Conjunto',
    icon: 'Trophy',
    color: 'from-rose-500 to-amber-500',
    description: 'Fútbol, baloncesto, voleibol, balonmano y normas oficiales'
  },
  {
    id: 'anatomy_fitness',
    name: 'Anatomía y Ejercicio Físico',
    icon: 'Activity',
    color: 'from-emerald-500 to-teal-600',
    description: 'Músculos, articulaciones, fuerza, resistencia y fisiología'
  },
  {
    id: 'health_nutrition',
    name: 'Salud, Hidratación y Hábitos',
    icon: 'Heart',
    color: 'from-sky-500 to-indigo-600',
    description: 'Hidratación deportiva, calentamiento y bienestar corporal'
  },
  {
    id: 'athletics_olympics',
    name: 'Atletismo y Juegos Olímpicos',
    icon: 'Flame',
    color: 'from-amber-500 to-orange-600',
    description: 'Carreras, saltos, historia olímpica y espíritu deportivo'
  }
];

export const ALL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'sports_rules',
    categoryIcon: '⚽',
    question: '¿Cuántos jugadores por equipo están en el terreno de juego durante un partido oficial de fútbol?',
    options: ['9 jugadores', '11 jugadores', '10 jugadores', '12 jugadores'],
    correctIndex: 1,
    explanation: 'Un equipo de fútbol oficial juega con 11 jugadores en cancha (10 de campo y 1 guardameta).'
  },
  {
    id: 'q2',
    category: 'sports_rules',
    categoryIcon: '🏀',
    question: 'En baloncesto, ¿cuántos puntos vale una canasta anotada desde más allá del arco perimetral?',
    options: ['1 punto', '2 puntos', '3 puntos', '4 puntos'],
    correctIndex: 2,
    explanation: 'Los lanzamientos convertidos detrás de la línea de 6.75 m (FIBA) o 7.24 m (NBA) suman 3 puntos.'
  },
  {
    id: 'q3',
    category: 'anatomy_fitness',
    categoryIcon: '🦵',
    question: '¿Cuál es el grupo muscular principal que se activa en la parte frontal del muslo al hacer sentadillas?',
    options: ['Cuádriceps', 'Bíceps braquial', 'Trapecio', 'Dorsal ancho'],
    correctIndex: 0,
    explanation: 'Los cuádriceps femorales extienden la rodilla y son el motor principal en las sentadillas y saltos.'
  },
  {
    id: 'q4',
    category: 'health_nutrition',
    categoryIcon: '🔥',
    question: '¿Qué fase fundamental debemos realizar SIEMPRE antes de iniciar ejercicio de alta intensidad?',
    options: ['Dormir 20 minutos', 'Calentamiento articular', 'Comer alimentos pesados', 'Estiramientos estáticos bruscos'],
    correctIndex: 1,
    explanation: 'El calentamiento progresivo eleva la temperatura muscular, activa el sistema nervioso y previene lesiones.'
  },
  {
    id: 'q5',
    category: 'sports_rules',
    categoryIcon: '🏐',
    question: 'En voleibol, ¿cuántos toques máximos consecutivos puede dar un equipo antes de pasar el balón a la red rival?',
    options: ['2 toques', '4 toques', '3 toques', 'Toques ilimitados'],
    correctIndex: 2,
    explanation: 'El reglamento permite un máximo de 3 toques por equipo (sin contar el bloqueo) para devolver el balón.'
  },
  {
    id: 'q6',
    category: 'health_nutrition',
    categoryIcon: '💧',
    question: '¿Cuál es la forma más saludable y efectiva de reponer líquidos durante una sesión de entrenamiento?',
    options: ['Bebidas muy azucaradas', 'Sorbos regulares de agua fresca', 'Refrescos carbonatados', 'Esperar a tener sed extrema'],
    correctIndex: 1,
    explanation: 'Beber pequeños sorbos de agua a intervalos regulares mantiene la hidratación sin causar pesadez estomacal.'
  },
  {
    id: 'q7',
    category: 'athletics_olympics',
    categoryIcon: '🏃',
    question: 'En las pruebas de atletismo de relevos (4x100m), ¿cómo se llama el tubo cilíndrico que se transfieren los atletas?',
    options: ['Testigo o Estafeta', 'Bate de relevo', 'Antorcha', 'Mancuerna'],
    correctIndex: 0,
    explanation: 'El testigo (o estafeta) debe entregarse obligatoriamente dentro de la zona de transferencia de 30 metros.'
  },
  {
    id: 'q8',
    category: 'sports_rules',
    categoryIcon: '⚾',
    question: 'En béisbol, ¿cuántos "strikes" acumulados dejan fuera de turno (ponche/out) a un bateador?',
    options: ['2 strikes', '4 strikes', '3 strikes', '5 strikes'],
    correctIndex: 2,
    explanation: 'Al tercer strike no bateado válidamente, el bateador queda ponchado (strikeout).'
  },
  {
    id: 'q9',
    category: 'anatomy_fitness',
    categoryIcon: '🧘',
    question: '¿Qué capacidad física condicional se entrena mediante el trabajo de rango y amplitud articular?',
    options: ['Potencia explosiva', 'Velocidad pura', 'Flexibilidad / Movilidad', 'Fuerza isométrica máxima'],
    correctIndex: 2,
    explanation: 'La flexibilidad y movilidad permiten ejecutar movimientos articulares amplios con soltura y sin dolor.'
  },
  {
    id: 'q10',
    category: 'athletics_olympics',
    categoryIcon: '🥇',
    question: '¿Cada cuántos años se celebran los Juegos Olímpicos tradicionales de verano?',
    options: ['Cada 2 años', 'Cada 3 años', 'Cada 4 años', 'Cada 5 años'],
    correctIndex: 2,
    explanation: 'El ciclo olímpico clásico (Olimpiada) tiene una duración de 4 años entre cada edición.'
  },
  {
    id: 'q11',
    category: 'sports_rules',
    categoryIcon: '🤾',
    question: 'En balonmano (handball), ¿cuántos pasos puede dar un jugador con el balón en las manos sin botarlo?',
    options: ['Máximo 2 pasos', 'Máximo 3 pasos', 'Máximo 5 pasos', 'Pasos ilimitados'],
    correctIndex: 1,
    explanation: 'En balonmano se permite dar hasta 3 pasos sin botar el balón antes de pasar, lanzar o iniciar el bote.'
  },
  {
    id: 'q12',
    category: 'health_nutrition',
    categoryIcon: '❤️',
    question: '¿Cuál es el rango aproximado de frecuencia cardíaca en reposo saludable para un adolescente o adulto activo?',
    options: ['10 a 20 ppm', '60 a 100 ppm', '140 a 180 ppm', '200 a 240 ppm'],
    correctIndex: 1,
    explanation: 'El ritmo cardíaco normal en reposo oscila generalmente entre 60 y 100 pulsaciones por minuto (ppm).'
  },
  {
    id: 'q13',
    category: 'anatomy_fitness',
    categoryIcon: '🫁',
    question: '¿Qué gas indispensable toma el cuerpo del aire en los pulmones para transportarlo a los músculos en ejercicio?',
    options: ['Nitrógeno puro', 'Oxígeno (O₂)', 'Dióxido de carbono', 'Helio'],
    correctIndex: 1,
    explanation: 'El oxígeno viaja por la hemoglobina en la sangre hasta las mitocondrias musculares para generar energía aeróbica (ATP).'
  },
  {
    id: 'q14',
    category: 'health_nutrition',
    categoryIcon: '🤝',
    question: '¿Cómo se denomina en el deporte el principio de jugar con honestidad, respeto a rivales y aceptar las reglas?',
    options: ['Juego Limpio (Fair Play)', 'Táctica de bloqueo', 'Ventaja táctica', 'Presión psicológica'],
    correctIndex: 0,
    explanation: 'El Fair Play promueve la deportividad, el respeto mutuo, la no violencia y la integridad en la competencia.'
  },
  {
    id: 'q15',
    category: 'athletics_olympics',
    categoryIcon: '⏱️',
    question: '¿Cuál es la distancia oficial de una carrera de Maratón clásica?',
    options: ['21.097 km', '42.195 km', '50.000 km', '35.500 km'],
    correctIndex: 1,
    explanation: 'La distancia oficial fijada desde los Juegos Olímpicos de Londres 1908 es de 42.195 kilómetros.'
  }
];
