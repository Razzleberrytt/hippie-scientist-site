
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Atom, Brain, Heart, Users } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: "Mind",
    desc: "Psychedelic research and neuroplasticity studies to understand consciousness."
  },
  {
    icon: Heart,
    title: "Spirit",
    desc: "Exploring ancient wisdom, ritual, and the interconnectedness of all things."
  },
  {
    icon: Atom,
    title: "Science",
    desc: "Bridging quantum theory and modern science with introspective awareness."
  },
  {
    icon: Users,
    title: "Community",
    desc: "Join the global conversation around human evolution and healing."
  }
];

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>The Hippie Scientist - Consciousness Research</title>
        <meta name="description" content="Explore consciousness through psychedelic research, ancient wisdom, and modern science." />
      </Helmet>

      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 psychedelic-text">
              The Hippie Scientist
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              A fusion of ancient wisdom, psychedelics, and modern science to understand the mind, body, and spirit.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="p-6 border border-gray-700 rounded-lg bg-opacity-10 backdrop-blur-md glass-card"
              >
                <Icon className="h-10 w-10 text-psychedelic-purple mb-4" aria-hidden="true" />
                <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-300">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
