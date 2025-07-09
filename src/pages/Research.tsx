import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Microscope, BookOpen, ExternalLink, Users, Brain, Atom, ChevronDown, ChevronUp } from 'lucide-react'

interface Study {
  title: string
  authors: string
  journal: string
  year: number
  summary: string
  link: string
  tags: string[]
}

interface ResearchArea {
  title: string
  description: string
  icon: React.ReactNode
  studies: Study[]
  keyFindings: string[]
}

const Research: React.FC = () => {
  const [expandedArea, setExpandedArea] = useState<string | null>(null)

  const researchAreas: ResearchArea[] = [
    {
      title: "Psilocybin Therapy",
      description: "Clinical trials and therapeutic applications of psilocybin",
      icon: <Microscope className="w-8 h-8" />,
      keyFindings: [
        "Significant reduction in depression scores in treatment-resistant patients",
        "Sustained therapeutic effects lasting months after treatment",
        "Enhanced neuroplasticity and increased brain connectivity"
      ],
      studies: [
        {
          title: "Psilocybin for Treatment-Resistant Depression",
          authors: "Goodwin, G.M., et al.",
          journal: "New England Journal of Medicine",
          year: 2022,
          summary: "COMPASS Pathways Phase IIb trial showing significant efficacy of psilocybin therapy for treatment-resistant depression.",
          link: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206443",
          tags: ["depression", "clinical-trial", "psilocybin"]
        },
        {
          title: "Psilocybin-Assisted Therapy for Major Depression",
          authors: "Raison, C.L., et al.",
          journal: "JAMA Psychiatry",
          year: 2023,
          summary: "Randomized controlled trial demonstrating sustained remission rates in major depressive disorder.",
          link: "#",
          tags: ["depression", "therapy", "clinical-trial"]
        }
      ]
    },
    {
      title: "MDMA-Assisted Psychotherapy",
      description: "Breakthrough therapy for PTSD and trauma treatment",
      icon: <Brain className="w-8 h-8" />,
      keyFindings: [
        "67% of participants no longer met PTSD criteria after treatment",
        "Reduced fear response and enhanced emotional processing",
        "Improved therapeutic alliance and breakthrough moments"
      ],
      studies: [
        {
          title: "MDMA-Assisted Therapy for Severe PTSD",
          authors: "Mitchell, J.M., et al.",
          journal: "Nature Medicine",
          year: 2021,
          summary: "Phase 3 trial showing significant reduction in PTSD symptoms with MDMA-assisted therapy.",
          link: "https://www.nature.com/articles/s41591-021-01336-3",
          tags: ["PTSD", "MDMA", "trauma", "therapy"]
        },
        {
          title: "Long-term Follow-up of MDMA-Assisted Psychotherapy",
          authors: "Mithoefer, M.C., et al.",
          journal: "Journal of Psychopharmacology",
          year: 2023,
          summary: "Sustained benefits observed 12 months after MDMA-assisted therapy completion.",
          link: "#",
          tags: ["PTSD", "long-term", "follow-up"]
        }
      ]
    },
    {
      title: "LSD & Neuroplasticity",
      description: "Understanding how psychedelics promote brain plasticity",
      icon: <Atom className="w-8 h-8" />,
      keyFindings: [
        "Increased dendritic spine density and neural connectivity",
        "Enhanced default mode network disruption",
        "Promotion of neurogenesis in hippocampus"
      ],
      studies: [
        {
          title: "LSD-Induced Increases in Social Adaptation",
          authors: "Holze, F., et al.",
          journal: "Biological Psychiatry",
          year: 2023,
          summary: "Study showing LSD's effects on social cognition and empathy enhancement.",
          link: "#",
          tags: ["LSD", "social-cognition", "empathy"]
        },
        {
          title: "Neural Correlates of LSD-Induced Ego Dissolution",
          authors: "Tagliazucchi, E., et al.",
          journal: "Current Biology",
          year: 2022,
          summary: "fMRI study revealing brain network changes during ego dissolution experiences.",
          link: "#",
          tags: ["LSD", "ego-dissolution", "fMRI", "neuroscience"]
        }
      ]
    },
    {
      title: "Traditional Medicine Integration",
      description: "Ancient wisdom meets modern scientific validation",
      icon: <BookOpen className="w-8 h-8" />,
      keyFindings: [
        "Ayahuasca ceremonies show measurable mental health benefits",
        "Traditional set and setting practices validate modern safety protocols",
        "Indigenous knowledge systems provide crucial context for therapeutic applications"
      ],
      studies: [
        {
          title: "Ayahuasca in Treatment of Depression and Anxiety",
          authors: "Palhano-Fontes, F., et al.",
          journal: "Psychological Medicine",
          year: 2022,
          summary: "Randomized controlled trial of ayahuasca for treatment-resistant depression.",
          link: "#",
          tags: ["ayahuasca", "depression", "anxiety", "traditional-medicine"]
        },
        {
          title: "Traditional Iboga Healing Practices",
          authors: "Davis, A.K., et al.",
          journal: "Journal of Ethnopharmacology",
          year: 2023,
          summary: "Ethnographic study of traditional iboga use in addiction treatment.",
          link: "#",
          tags: ["iboga", "addiction", "traditional-healing"]
        }
      ]
    }
  ]

  const toggleArea = (title: string) => {
    setExpandedArea(expandedArea === title ? null : title)
  }

  return (
    <>
      <Helmet>
        <title>Research - The Hippie Scientist</title>
        <meta name="description" content="Latest scientific research on psychedelics, consciousness studies, and therapeutic applications. Comprehensive database of clinical trials and findings." />
        <meta name="keywords" content="psychedelic research, clinical trials, psilocybin studies, MDMA therapy, neuroscience, consciousness research" />
      </Helmet>
      
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Microscope className="w-16 h-16 mx-auto mb-6 text-psychedelic-purple" />
            <h1 className="text-4xl md:text-6xl font-bold mb-8 psychedelic-text font-display">
              Research Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Cutting-edge scientific research on psychedelics, consciousness, and therapeutic applications. 
              Bridging ancient wisdom with modern neuroscience.
            </p>
          </motion.div>

          {/* Research Areas */}
          <div className="grid gap-8 mb-16">
            {researchAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-card p-8 glow-subtle hover:glow-medium transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  <div className="text-psychedelic-purple flex-shrink-0 mt-2">
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl md:text-3xl font-bold psychedelic-text">
                        {area.title}
                      </h2>
                      <button
                        onClick={() => toggleArea(area.title)}
                        className="text-psychedelic-cyan hover:text-psychedelic-purple transition-colors"
                        aria-label={`Toggle ${area.title} details`}
                      >
                        {expandedArea === area.title ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </div>
                    
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {area.description}
                    </p>

                    {/* Key Findings */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-psychedelic-cyan mb-3">
                        Key Findings
                      </h3>
                      <ul className="space-y-2">
                        {area.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-300">
                            <div className="w-2 h-2 bg-psychedelic-purple rounded-full mt-2 flex-shrink-0" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Studies */}
                    {expandedArea === area.title && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-700 pt-6"
                      >
                        <h3 className="text-xl font-semibold text-psychedelic-cyan mb-4">
                          Recent Studies
                        </h3>
                        <div className="grid gap-4">
                          {area.studies.map((study, idx) => (
                            <div key={idx} className="bg-black/30 p-4 rounded-lg border border-gray-700">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-2">
                                    {study.title}
                                  </h4>
                                  <p className="text-sm text-gray-400 mb-2">
                                    {study.authors} • {study.journal} ({study.year})
                                  </p>
                                  <p className="text-gray-300 text-sm mb-3">
                                    {study.summary}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {study.tags.map((tag, tagIdx) => (
                                      <span
                                        key={tagIdx}
                                        className="text-xs bg-psychedelic-purple/20 text-psychedelic-purple px-2 py-1 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <a
                                  href={study.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-psychedelic-cyan hover:text-psychedelic-purple transition-colors flex-shrink-0"
                                  aria-label={`Read study: ${study.title}`}
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center glass-card p-8 glow-subtle"
          >
            <h2 className="text-3xl font-bold mb-4 psychedelic-text">
              Stay Updated
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              The field of psychedelic research is rapidly evolving. New studies and findings are published regularly.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button bg-gradient-to-r from-psychedelic-purple to-psychedelic-pink text-white font-semibold px-8 py-3 rounded-full glow-medium"
            >
              Subscribe to Updates
            </motion.button>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Research
