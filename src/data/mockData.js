// Mock data for the psychedelic e-commerce platform
export const products = [
  {
    id: '1',
    name: 'Psilocybe Cubensis Extract',
    description: 'Premium psilocybin extract for enhanced consciousness exploration. Carefully prepared using traditional methods with modern quality control.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=400&fit=crop',
    category: 'Psilocybin',
    inStock: true,
    featured: true,
    effects: ['Visual enhancement', 'Euphoria', 'Introspection'],
    potency: 'High',
    duration: '4-6 hours',
    rating: 4.8,
    reviews: 127
  },
  {
    id: '2',
    name: 'Golden Teacher Microdose',
    description: 'Precision-dosed Golden Teacher mushrooms for microdosing protocols. Perfect for beginners and experienced users.',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop',
    category: 'Psilocybin',
    inStock: true,
    featured: true,
    effects: ['Creativity boost', 'Mood enhancement', 'Focus'],
    potency: 'Micro',
    duration: '2-4 hours',
    rating: 4.9,
    reviews: 203
  },
  {
    id: '3',
    name: 'Blue Meanies Premium',
    description: 'High-potency Blue Meanies strain known for intense visual experiences and deep introspection.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop',
    category: 'Psilocybin',
    inStock: true,
    featured: false,
    effects: ['Intense visuals', 'Deep introspection', 'Spiritual insights'],
    potency: 'Very High',
    duration: '6-8 hours',
    rating: 4.7,
    reviews: 89
  },
  {
    id: '4',
    name: 'Penis Envy Chocolates',
    description: 'Gourmet chocolate infused with Penis Envy mushrooms. Premium taste meets consciousness exploration.',
    price: 67.99,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop',
    category: 'Edibles',
    inStock: true,
    featured: true,
    effects: ['Euphoria', 'Body relaxation', 'Mild visuals'],
    potency: 'Medium',
    duration: '3-5 hours',
    rating: 4.6,
    reviews: 156
  },
  {
    id: '5',
    name: 'Ayahuasca Preparation Kit',
    description: 'Traditional ayahuasca preparation with authentic vine and chacruna. Includes preparation guide.',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1518985384211-ab11218c0b48?w=400&h=400&fit=crop',
    category: 'DMT',
    inStock: false,
    featured: false,
    effects: ['Spiritual journey', 'Emotional healing', 'Visions'],
    potency: 'Extreme',
    duration: '4-6 hours',
    rating: 4.9,
    reviews: 67
  },
  {
    id: '6',
    name: 'Mescaline Cactus Extract',
    description: 'Pure mescaline extract from sustainable San Pedro cactus. Includes dosage guidelines and safety information.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=400&h=400&fit=crop',
    category: 'Mescaline',
    inStock: true,
    featured: false,
    effects: ['Color enhancement', 'Empathy', 'Nature connection'],
    potency: 'High',
    duration: '8-12 hours',
    rating: 4.5,
    reviews: 43
  }
];

export const blogPosts = [
  {
    id: '1',
    title: 'The Science Behind Psilocybin: Understanding Neuroplasticity',
    excerpt: 'Recent research reveals how psilocybin promotes neural growth and enhances brain connectivity, offering new insights into consciousness and mental health.',
    author: 'Dr. Sarah Chen',
    date: '2025-01-02',
    readTime: 8,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop',
    tags: ['Science', 'Psilocybin', 'Neuroplasticity'],
    category: 'Research'
  },
  {
    id: '2',
    title: 'Microdosing Protocols: A Comprehensive Guide',
    excerpt: 'Everything you need to know about microdosing schedules, dosages, and tracking your experiences for optimal results.',
    author: 'James Fadiman',
    date: '2024-12-28',
    readTime: 12,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop',
    tags: ['Microdosing', 'Protocol', 'Guide'],
    category: 'Education'
  },
  {
    id: '3',
    title: 'Set and Setting: Creating Safe Psychedelic Experiences',
    excerpt: 'The importance of mindset and environment in psychedelic experiences, with practical tips for preparation and integration.',
    author: 'Timothy Leary Institute',
    date: '2024-12-25',
    readTime: 10,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    tags: ['Safety', 'Preparation', 'Integration'],
    category: 'Safety'
  },
  {
    id: '4',
    title: 'The Renaissance of Psychedelic Research',
    excerpt: 'How modern science is rediscovering the therapeutic potential of psychedelics after decades of prohibition.',
    author: 'Dr. Robin Carhart-Harris',
    date: '2024-12-20',
    readTime: 15,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    tags: ['Research', 'History', 'Therapy'],
    category: 'Research'
  },
  {
    id: '5',
    title: 'Integration Practices: Making Meaning from Psychedelic Experiences',
    excerpt: 'Practical approaches to integrating insights from psychedelic experiences into daily life for lasting positive change.',
    author: 'Dr. Rosalind Watts',
    date: '2024-12-15',
    readTime: 11,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    tags: ['Integration', 'Practice', 'Wellbeing'],
    category: 'Integration'
  }
];

export const substances = [
  {
    id: '1',
    name: 'Psilocybin',
    category: 'Psychedelic',
    description: 'A naturally occurring psychedelic compound found in various mushroom species, known for its therapeutic potential.',
    effects: ['Visual hallucinations', 'Euphoria', 'Introspection', 'Emotional release'],
    duration: {
      onset: '30-60 minutes',
      peak: '2-3 hours',
      total: '4-6 hours'
    },
    dosage: {
      threshold: '0.1-0.2g',
      light: '0.5-1g',
      common: '1-2.5g',
      strong: '2.5-4g',
      heavy: '4g+'
    },
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=300&fit=crop',
    legality: 'Illegal in most countries, decriminalized in some regions',
    interactions: ['MAOIs', 'Lithium', 'Tramadol'],
    risks: ['Psychological distress', 'Panic attacks', 'Triggering latent mental health issues']
  },
  {
    id: '2',
    name: 'LSD',
    category: 'Psychedelic',
    description: 'Lysergic acid diethylamide is a powerful synthetic psychedelic known for its profound consciousness-altering effects.',
    effects: ['Intense visuals', 'Synesthesia', 'Ego dissolution', 'Time distortion'],
    duration: {
      onset: '20-90 minutes',
      peak: '3-5 hours',
      total: '8-12 hours'
    },
    dosage: {
      threshold: '10-20µg',
      light: '25-75µg',
      common: '75-150µg',
      strong: '150-400µg',
      heavy: '400µg+'
    },
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    legality: 'Illegal worldwide (Schedule I)',
    interactions: ['Lithium', 'Tramadol', 'MAOIs'],
    risks: ['HPPD', 'Psychological distress', 'Dangerous behavior due to altered perception']
  },
  {
    id: '3',
    name: 'MDMA',
    category: 'Empathogen',
    description: 'Known for producing empathy, emotional openness, and enhanced sensory perception. Used in therapeutic settings.',
    effects: ['Empathy', 'Euphoria', 'Enhanced touch', 'Emotional openness'],
    duration: {
      onset: '30-60 minutes',
      peak: '2-3 hours',
      total: '3-6 hours'
    },
    dosage: {
      threshold: '30-50mg',
      light: '50-75mg',
      common: '75-125mg',
      strong: '125-175mg',
      heavy: '175mg+'
    },
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&h=300&fit=crop',
    legality: 'Illegal worldwide, FDA breakthrough therapy status',
    interactions: ['MAOIs', 'SSRIs', 'Stimulants'],
    risks: ['Hyperthermia', 'Dehydration', 'Serotonin syndrome', 'Neurotoxicity']
  },
  {
    id: '4',
    name: 'DMT',
    category: 'Psychedelic',
    description: 'N,N-Dimethyltryptamine, a powerful and short-acting psychedelic found in many plants and produced naturally in the human body.',
    effects: ['Intense visuals', 'Entity encounters', 'Spiritual experiences', 'Reality dissolution'],
    duration: {
      onset: '0-2 minutes',
      peak: '2-5 minutes',
      total: '5-30 minutes'
    },
    dosage: {
      threshold: '5-10mg',
      light: '10-20mg',
      common: '20-40mg',
      strong: '40-60mg',
      heavy: '60mg+'
    },
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1518985384211-ab11218c0b48?w=400&h=300&fit=crop',
    legality: 'Illegal in most countries, naturally occurring',
    interactions: ['MAOIs', 'Harmalas', 'SSRIs'],
    risks: ['Psychological trauma', 'Panic attacks', 'Dangerous behavior']
  },
  {
    id: '5',
    name: 'Mescaline',
    category: 'Psychedelic',
    description: 'A naturally occurring psychedelic found in various cacti species, known for its gentle and introspective effects.',
    effects: ['Color enhancement', 'Empathy', 'Nature connection', 'Spiritual insights'],
    duration: {
      onset: '1-2 hours',
      peak: '4-6 hours',
      total: '8-12 hours'
    },
    dosage: {
      threshold: '50-100mg',
      light: '100-200mg',
      common: '200-400mg',
      strong: '400-600mg',
      heavy: '600mg+'
    },
    riskLevel: 'medium',
    image: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?w=400&h=300&fit=crop',
    legality: 'Illegal in most countries, legal cactus cultivation varies',
    interactions: ['MAOIs', 'Stimulants', 'Depressants'],
    risks: ['Nausea', 'Vomiting', 'Psychological distress', 'Cardiovascular stress']
  }
];

export const categories = [
  { id: 'psilocybin', name: 'Psilocybin', description: 'Magic mushrooms and related products' },
  { id: 'dmt', name: 'DMT', description: 'Dimethyltryptamine preparations' },
  { id: 'mescaline', name: 'Mescaline', description: 'Cactus-derived psychedelics' },
  { id: 'edibles', name: 'Edibles', description: 'Infused foods and chocolates' },
  { id: 'kits', name: 'Kits', description: 'Preparation and testing kits' },
  { id: 'accessories', name: 'Accessories', description: 'Vaporizers and tools' }
];

export const reviews = [
  {
    id: '1',
    productId: '1',
    author: 'Explorer123',
    rating: 5,
    title: 'Life-changing experience',
    content: 'This product exceeded all my expectations. The quality is exceptional and the effects were profound.',
    date: '2024-12-30',
    verified: true
  },
  {
    id: '2',
    productId: '2',
    author: 'MindfulUser',
    rating: 5,
    title: 'Perfect for microdosing',
    content: 'Excellent consistency and quality. Perfect for my microdosing protocol.',
    date: '2024-12-28',
    verified: true
  },
  {
    id: '3',
    productId: '1',
    author: 'SpiritualSeeker',
    rating: 4,
    title: 'Powerful and clean',
    content: 'Very potent and clean experience. Highly recommend for experienced users.',
    date: '2024-12-25',
    verified: true
  }
];

export const faqs = [
  {
    id: '1',
    question: 'How do I store psychedelic products?',
    answer: 'Store in a cool, dry, dark place away from children and pets. Use airtight containers and keep below 70°F for optimal potency preservation.'
  },
  {
    id: '2',
    question: 'What is the difference between microdosing and a full dose?',
    answer: 'Microdosing involves taking sub-perceptual amounts (typically 1/10th of a full dose) for cognitive enhancement without hallucinations. Full doses produce noticeable psychedelic effects.'
  },
  {
    id: '3',
    question: 'Are these products legal?',
    answer: 'Laws vary by jurisdiction. Many areas have decriminalized or legalized certain psychedelics. Always check your local laws before purchasing or using these products.'
  },
  {
    id: '4',
    question: 'How long do the effects last?',
    answer: 'Duration varies by substance and dosage. Psilocybin typically lasts 4-6 hours, while LSD can last 8-12 hours. Start with lower doses to gauge your sensitivity.'
  },
  {
    id: '5',
    question: 'Can I take psychedelics with other medications?',
    answer: 'Always consult with a healthcare provider before combining with medications. Some combinations can be dangerous, especially with MAOIs, SSRIs, and lithium.'
  }
];

export const testimonials = [
  {
    id: '1',
    author: 'Sarah M.',
    location: 'Colorado',
    content: 'PsycheCo has transformed my understanding of consciousness. The products are top-quality and the educational resources are invaluable.',
    rating: 5,
    product: 'Golden Teacher Microdose'
  },
  {
    id: '2',
    author: 'Michael R.',
    location: 'California',
    content: 'Professional service, discrete packaging, and life-changing products. Couldn\'t be happier with my experience.',
    rating: 5,
    product: 'Psilocybe Cubensis Extract'
  },
  {
    id: '3',
    author: 'Emma L.',
    location: 'Oregon',
    content: 'The educational content helped me prepare properly for my first journey. Grateful for the emphasis on safety and integration.',
    rating: 5,
    product: 'Ayahuasca Preparation Kit'
  }
];