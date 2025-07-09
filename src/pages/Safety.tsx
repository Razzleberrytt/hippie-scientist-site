import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Shield, AlertTriangle, Heart, Phone, MapPin, Users, Clock, CheckCircle } from 'lucide-react'

const Safety: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basics')

  const safetyProtocols = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Set & Setting",
      description: "Your mindset and environment are crucial for a safe experience"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Trip Sitter",
      description: "Always have a trusted, sober person present during your experience"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Start Low",
      description: "Begin with lower doses to understand your sensitivity and response"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Safe Space",
      description: "Choose a comfortable, familiar environment free from external stressors"
    }
  ]

  const emergencyContacts = [
    {
      name: "Fireside Project",
      description: "Psychedelic peer support helpline",
      phone: "+1-623-473-7433",
      available: "24/7 text support"
    },
    {
      name: "MAPS Integration",
      description: "Integration support resources",
      phone: "Visit website for local resources",
      available: "Therapist directory"
    },
    {
      name: "Emergency Services",
      description: "For medical emergencies",
      phone: "911 (US) / 999 (UK) / 112 (EU)",
      available: "24/7 emergency response"
    }
  ]

  const substanceInfo = [
    {
      name: "Psilocybin",
      duration: "4-6 hours",
      onset: "30-60 minutes",
      safetyNotes: "Generally well-tolerated. Avoid with certain medications.",
      contraindications: ["Heart conditions", "Certain antidepressants", "Pregnancy"]
    },
    {
      name: "LSD",
      duration: "8-12 hours",
      onset: "45-90 minutes",
      safetyNotes: "Long duration requires proper preparation and setting.",
      contraindications: ["Psychiatric conditions", "Heart problems", "Pregnancy"]
    },
    {
      name: "MDMA",
      duration: "3-5 hours",
      onset: "30-45 minutes",
      safetyNotes: "Stay hydrated, avoid overheating, don't redose frequently.",
      contraindications: ["Heart conditions", "High blood pressure", "Pregnancy"]
    }
  ]

  const tabs = [
    { id: 'basics', label: 'Safety Basics', icon: <Shield className="w-4 h-4" /> },
    { id: 'substances', label: 'Substance Info', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'emergency', label: 'Emergency', icon: <Phone className="w-4 h-4" /> }
  ]

  return (
    <>
      <Helmet>
        <title>Safety & Harm Reduction - The Hippie Scientist</title>
        <meta name="description" content="Comprehensive safety protocols and harm reduction information for psychedelic use. Emergency contacts and substance-specific guidelines." />
        <meta name="keywords" content="psychedelic safety, harm reduction, trip sitter, set and setting, emergency contacts, substance safety" />
      </Helmet>

      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Shield className="w-16 h-16 mx-auto mb-6 text-psychedelic-green" />
            <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
              Safety & Harm Reduction
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Your safety is our priority. Comprehensive guidelines, protocols, and resources for responsible psychedelic exploration.
            </p>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6 mb-12 border-l-4 border-psychedelic-orange glow-subtle"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-psychedelic-orange flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-psychedelic-orange mb-2">
                  Important Legal & Medical Disclaimer
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  This information is for educational purposes only. Many psychedelic substances are illegal in most jurisdictions. 
                  Always consult with healthcare professionals before use, especially if you have medical conditions or take medications. 
                  This site does not encourage illegal activity.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="glass-card p-2 inline-flex rounded-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-psychedelic-purple text-white glow-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'basics' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Safety Protocols */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {safetyProtocols.map((protocol, index) => (
                    <motion.div
                      key={protocol.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6 glow-subtle hover:glow-medium transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-psychedelic-green flex-shrink-0 mt-1">
                          {protocol.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {protocol.title}
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {protocol.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Detailed Guidelines */}
                <div className="glass-card p-8 glow-subtle">
                  <h2 className="text-2xl font-bold psychedelic-text mb-6">
                    Detailed Safety Guidelines
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-psychedelic-cyan mb-3">
                        Before Your Experience
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Research the substance thoroughly, including effects, duration, and risks</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Test your substance using reagent testing kits</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Clear your schedule for the entire duration plus recovery time</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Prepare your environment: comfortable, safe, and free from interruptions</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-psychedelic-cyan mb-3">
                        During Your Experience
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Stay hydrated but don't overhydrate</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Avoid driving or operating machinery</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Have emergency contacts readily available</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Remember: the experience is temporary</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-psychedelic-cyan mb-3">
                        After Your Experience
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Get adequate rest and nutrition</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Journal about your experience for integration</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Consider speaking with an integration therapist</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-psychedelic-green mt-0.5 flex-shrink-0" />
                          <span>Allow time for processing before considering another experience</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'substances' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid gap-6"
              >
                {substanceInfo.map((substance, index) => (
                  <motion.div
                    key={substance.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-card p-6 glow-subtle"
                  >
                    <h3 className="text-2xl font-bold psychedelic-text mb-4">
                      {substance.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-psychedelic-cyan font-medium">Duration:</span>
                        <p className="text-gray-300">{substance.duration}</p>
                      </div>
                      <div>
                        <span className="text-psychedelic-cyan font-medium">Onset:</span>
                        <p className="text-gray-300">{substance.onset}</p>
                      </div>
                      <div>
                        <span className="text-psychedelic-cyan font-medium">Safety Notes:</span>
                        <p className="text-gray-300">{substance.safetyNotes}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-psychedelic-orange font-medium">Contraindications:</span>
                      <ul className="text-gray-300 mt-2">
                        {substance.contraindications.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-psychedelic-orange" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'emergency' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid gap-6 mb-8">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={contact.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6 glow-subtle"
                    >
                      <div className="flex items-start gap-4">
                        <Phone className="w-8 h-8 text-psychedelic-green flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {contact.name}
                          </h3>
                          <p className="text-gray-300 mb-2">{contact.description}</p>
                          <p className="text-psychedelic-cyan font-mono text-lg">
                            {contact.phone}
                          </p>
                          <p className="text-sm text-gray-400">{contact.available}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-card p-6 glow-subtle border-l-4 border-psychedelic-orange">
                  <h3 className="text-xl font-bold text-psychedelic-orange mb-4">
                    When to Seek Emergency Help
                  </h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-psychedelic-orange mt-0.5 flex-shrink-0" />
                      <span>Chest pain, difficulty breathing, or rapid heart rate</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-psychedelic-orange mt-0.5 flex-shrink-0" />
                      <span>Seizures or loss of consciousness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-psychedelic-orange mt-0.5 flex-shrink-0" />
                      <span>Severe agitation or risk of self-harm</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-psychedelic-orange mt-0.5 flex-shrink-0" />
                      <span>Hyperthermia (overheating) or dehydration</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Safety
