import React from 'react'
import { motion } from 'framer-motion'
import { Microscope, BookOpen, ExternalLink } from 'lucide-react'

const Research: React.FC = () => {
  const researchAreas = [
    {
      title: "Psychedelic Therapy",
      description: "Clinical trials and therapeutic applications of psychedelic substances",
      icon: <Microscope className="w-8 h-8" />,
      studies: [
        "MDMA-assisted therapy for PTSD",
        "Psilocybin for treatment-resistant depression",
        "LSD microdosing cognitive effects"
      ]
    },
    {
      title: "Neuroplasticity",
      description: "How psychedelics promote neural growth and brain connectivity",
      icon: <BookOpen className="w-8 h-8" />,
      studies: [
        "Default mode network modulation",
        "Synaptic plasticity enhancement",
        "Neurogenesis promotion"
      ]
    },
    {
      title: "Traditional Medicine",
      description: "Ancient wisdom meets modern scientific validation",
      icon: <ExternalLink className="w-8 h-8" />,
      studies: [
        "Ayahuasca ceremonial contexts",
        "Indigenous plant medicine",
        "Ethnobotanical research"
      ]
    }
  ]

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <Microscope className="w-16 h-16 mx-auto mb-6 text-psychedelic-cyan" />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
            Research & Studies
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Exploring the intersection of consciousness, neuroscience, and therapeutic potential
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {researchAreas.map((area, index) =>
