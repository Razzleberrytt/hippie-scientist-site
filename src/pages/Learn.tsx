import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  BookOpen,
  BrainCircuit,
  Compass,
  Leaf,
  FlaskConical,
  Globe,
  Gavel,
  Microscope,
  PlayCircle,
  Book,
  GraduationCap,
  Users,
  Shield,
  PenLine,
  Download,
  Library,
  TestTube2,
  LeafyGreen,
  Atom,
  Sparkles,
  Flower2,
  Lightbulb,
  BookCheck,
  Mic,
} from 'lucide-react'

const modules = [
  {
    icon: BookOpen,
    title: 'Intro to Ethnobotany',
    description: 'Study the cultural history of visionary plants.',
  },
  {
    icon: BrainCircuit,
    title: 'Neuroscience Basics',
    description: 'Explore how these compounds affect the brain.',
  },
  {
    icon: Compass,
    title: 'Integration Practices',
    description: 'Techniques to ground and apply insights.',
  },
  {
    icon: Leaf,
    title: 'Herbal Identification',
    description: 'Learn to recognize and safely harvest key species.',
  },
  {
    icon: FlaskConical,
    title: 'Lab Skills 101',
    description: 'Basic extraction and analysis methods.',
  },
  {
    icon: Globe,
    title: 'Cultural Traditions',
    description: 'Historical use of entheogens around the world.',
  },
  {
    icon: Gavel,
    title: 'Law & Ethics',
    description: 'Understand legal considerations and responsible use.',
  },
  {
    icon: Microscope,
    title: 'Advanced Neurochemistry',
    description: 'Deep dive into receptor dynamics and signaling.',
  },
  {
    icon: Compass,
    title: 'Field Research Methods',
    description: 'Collect data responsibly in natural settings.',
  },
  {
    icon: Users,
    title: 'Community Building',
    description: 'Create supportive networks for shared growth.',
  },
  {
    icon: Shield,
    title: 'Harm Reduction',
    description: 'Best practices to keep explorations safe.',
  },
  {
    icon: Library,
    title: 'Herbal Pharmacology',
    description: 'Study how active compounds interact with the body.',
  },
  {
    icon: TestTube2,
    title: 'Extraction Techniques',
    description: 'Make tinctures, oils, and concentrates at home.',
  },
  {
    icon: LeafyGreen,
    title: 'Medicinal Mushrooms',
    description: 'Explore adaptogenic fungi and their healing uses.',
  },
  {
    icon: Atom,
    title: 'Psychedelic Chemistry',
    description: 'Analyze molecular structures and biosynthetic pathways.',
  },
  {
    icon: Sparkles,
    title: 'Consciousness Studies',
    description: 'Philosophical perspectives on awareness and mind.',
  },
  {
    icon: Flower2,
    title: 'Plant Morphology',
    description: 'Examine the form and structure of botanical specimens.',
  },
]

const tutorials = [
  {
    icon: PlayCircle,
    title: 'Video Walkthroughs',
    description: 'Short clips demonstrating practical techniques.',
  },
  {
    icon: GraduationCap,
    title: 'Step-by-Step Guides',
    description: 'Structured lessons to track your progress.',
  },
  {
    icon: Book,
    title: 'Reading List',
    description: 'Hand-picked books and articles for deeper study.',
  },
  {
    icon: PenLine,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge as you progress.',
  },
  {
    icon: Download,
    title: 'Downloadable Charts',
    description: 'Reference sheets for quick learning.',
  },
  {
    icon: Mic,
    title: 'Podcast Series',
    description: 'Interviews with leading researchers and guides.',
  },
  {
    icon: BookCheck,
    title: 'Case Studies',
    description: 'Real-world examples to reinforce key lessons.',
  },
  {
    icon: Lightbulb,
    title: 'Idea Workshops',
    description: 'Exercises to spark creativity and insight.',
  },
]

export default function Learn() {
  return (
    <>
      <Helmet>
        <title>Learn - The Hippie Scientist</title>
        <meta
          name='description'
          content='Educational resources to deepen your understanding of herbs and psychedelics.'
        />
      </Helmet>

      <div className='min-h-screen px-4 pt-20'>
        <div className='mx-auto max-w-7xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-20 text-center'
          >
            <h1 className='text-gradient mb-6 text-5xl font-bold md:text-6xl'>Learn</h1>
            <p className='mx-auto max-w-3xl text-xl text-gray-300'>
              Self-paced lessons to expand your knowledge.
            </p>
          </motion.div>

          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {modules.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className='glass-card p-6 text-center'
              >
                <Icon
                  className='mx-auto mb-4 h-12 w-12 text-psychedelic-purple'
                  aria-hidden='true'
                />
                <h3 className='mb-2 text-xl font-bold text-white'>{title}</h3>
                <p className='text-gray-300'>{description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className='mt-24 text-center'
          >
            <h2 className='text-gradient mb-6 text-4xl font-bold'>Tutorials &amp; Resources</h2>
            <p className='mx-auto mb-12 max-w-2xl text-lg text-gray-300'>
              Dive deeper with curated tutorials and recommended reading.
            </p>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
              {tutorials.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className='glass-card p-6 text-center'
                >
                  <Icon
                    className='mx-auto mb-4 h-12 w-12 text-psychedelic-purple'
                    aria-hidden='true'
                  />
                  <h3 className='mb-2 text-xl font-bold text-white'>{title}</h3>
                  <p className='text-gray-300'>{description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
