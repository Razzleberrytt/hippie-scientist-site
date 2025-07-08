import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Microscope, Database, Shield, Users, BookOpen, Sparkles } from 'lucide-react'

const FeatureCard: React.FC<{
  icon: React.ReactNode
  title: string
  description: string
  link: string
  delay: number
}> = ({ icon, title, description, link, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Link to={link} className="block h-full">
        <div className="glass-card p-6 h-full glow-subtle hover:glow-medium transition-all duration-300">
          <div className="mb-4 text-psychedelic-purple group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-xl font-bold mb-3 psychedelic-text">
            {title}
          </h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            {description}
          </p>
          <div className="flex items-center text-psychedelic-cyan group-hover:translate-x-2 transition-transform duration-300">
            <span className="font-medium">Explore</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const Home: React.FC = () => {
  return (
    <div className="relative z-10">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-6"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-16 h-16 mx-auto text-psychedelic-purple mb-4" />
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-display">
              <span className="psychedelic-text">HIPPIE</span>
              <br />
              <span className="text-white">SCIENTIST</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
              Exploring the frontiers of consciousness through{' '}
              <span className="psychedelic-text font-semibold">psychedelic research</span>,{' '}
              <span className="psychedelic-text font-semibold">ancient wisdom</span>, and{' '}
              <span className="psychedelic-text font-semibold">modern science</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/research"
                  className="glass-button bg-gradient-to-r from-psychedelic-purple to-psychedelic-pink text-white font-semibold px-8 py-4 rounded-full glow-medium"
                >
                  Begin Journey
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/database"
                  className="glass-button px-8 py-4 rounded-full border border-psychedelic-cyan text-psychedelic-cyan hover:bg-psychedelic-cyan/10"
                >
                  Explore Database
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 psychedelic-text font-display">
              Consciousness Exploration
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto text-balance">
              A comprehensive platform for responsible psychedelic education and research
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Microscope className="w-8 h-8" />}
              title="Psychedelic Research"
              description="Dive deep into scientific studies on psilocybin, LSD, DMT, and other consciousness-expanding compounds."
              link="/research"
              delay={0.2}
            />
            
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Sacred Database"
              description="Comprehensive collection of psychoactive plants, compounds, and their traditional uses across cultures."
              link="/database"
              delay={0.4}
            />
            
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Ancient Wisdom"
              description="Discover timeless practices and knowledge of indigenous cultures working with plant medicines."
              link="/research"
              delay={0.6}
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Safety Protocols"
              description="Essential harm reduction information, set and setting guidelines for responsible exploration."
              link="/safety"
              delay={0.8}
            />
            
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Community Hub"
              description="Connect with like-minded explorers, researchers, and practitioners in our conscious community."
              link="/community"
              delay={1.0}
            />
            
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Integration"
              description="Tools and resources for integrating psychedelic experiences into daily life and personal growth."
              link="/research"
              delay={1.2}
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-12 glow-subtle"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-8 psychedelic-text font-display">
              Bridging Science & Spirit
            </h3>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-balance">
              We stand at the intersection of rigorous scientific inquiry and ancient spiritual wisdom. 
              Our mission is to responsibly explore consciousness, promote safety in psychedelic use, 
              and contribute to the growing body of research that may help heal individuals and society.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
