import type { MentalHealthArticle } from './types'
import {
  CLUSTER_A_REVIEW,
  DSM_5_TR,
  PARANOID_REVIEW,
  PERSONALITY_TREATMENT_LANCET,
  SCHEMA_PD_TRIAL,
  SCHIZOTYPAL_SYSTEMATIC_REVIEW,
  WHO_ICD11_CDDR,
} from './references'

const REVIEW_DATE = '2026-07-13'

export const clusterAMentalHealthArticles: MentalHealthArticle[] = [
  {
    slug: 'paranoid-personality-disorder',
    title: 'Paranoid Personality Disorder: Persistent Mistrust, Diagnosis, and Treatment',
    seoTitle: 'Paranoid Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to paranoid personality disorder, including persistent mistrust, differential diagnosis, treatment, relationship effects, and the limits of current research.',
    category: 'Personality disorders',
    cluster: 'Cluster A',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '11 min read',
    deck: 'Paranoid personality disorder involves a long-standing pattern of distrust and suspicious interpretation across relationships and settings. It is not the same thing as occasional caution, justified mistrust, or a psychotic disorder.',
    keyPoints: [
      {
        text: 'The central pattern is pervasive distrust and suspiciousness, with other people’s motives frequently interpreted as harmful, deceptive, disloyal, or threatening.',
        refs: ['dsm-5-tr', 'paranoid-review'],
      },
      {
        text: 'Clinicians must distinguish personality-based mistrust from delusions, trauma-related hypervigilance, substance effects, mood episodes, neurological illness, and realistic responses to danger or discrimination.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        text: 'Research on treatment is sparse. A stable, transparent therapeutic relationship is usually foundational, while medication is reserved for co-occurring conditions or carefully defined symptoms rather than the personality disorder itself.',
        refs: ['paranoid-review', 'cluster-a-review', 'personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What paranoid personality disorder looks like',
        paragraphs: [
          {
            text: 'Paranoid personality disorder is characterized by an enduring tendency to expect exploitation, betrayal, humiliation, or harm without sufficient evidence. A person may scrutinize remarks for hidden meanings, hesitate to confide in others, hold grudges, question loyalty, or react strongly to perceived attacks on character.',
            refs: ['dsm-5-tr', 'paranoid-review'],
          },
          {
            text: 'The word paranoid is often used casually, but a clinical diagnosis requires a broad and persistent pattern with meaningful consequences. Healthy caution, skepticism, privacy, anger after betrayal, and mistrust in an unsafe environment are not automatically symptoms of a personality disorder.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Paranoid personality disorder versus psychosis',
        paragraphs: [
          {
            text: 'People with paranoid personality disorder generally maintain reality testing, even though their interpretations may be rigid or biased toward threat. Delusional disorder and schizophrenia involve different patterns, including fixed delusions, hallucinations, disorganization, or other psychotic symptoms. Severe stress can blur the boundary, so assessment should focus on conviction, flexibility, context, and associated symptoms.',
            refs: ['dsm-5-tr', 'paranoid-review'],
          },
          {
            text: 'Trauma-related hypervigilance, PTSD, bipolar or depressive episodes with psychotic features, substance intoxication, sleep deprivation, dementia, brain injury, and some medical conditions can also cause suspiciousness. A sudden onset or major change from baseline requires medical and psychiatric evaluation rather than assuming a personality disorder.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'How diagnosis is made',
        paragraphs: [
          {
            text: 'Diagnosis is based on patterns across time and settings, not on whether a clinician agrees with one disputed belief. A careful assessment explores relationships, work, conflict history, cultural context, real experiences of betrayal or discrimination, substance use, trauma, medical factors, and whether suspiciousness appears only during another disorder.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
          {
            text: 'Because mistrust can affect the assessment itself, clinicians should explain why questions are being asked, avoid secretive or unnecessarily authoritative behavior, document uncertainty, and revisit conclusions as more longitudinal information becomes available.',
            refs: ['paranoid-review', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Treatment and the importance of trust',
        paragraphs: [
          {
            text: 'The evidence base is limited, and there are few trials focused specifically on paranoid personality disorder. Treatment usually begins with a predictable, respectful, transparent alliance. Pressuring disclosure, arguing aggressively about beliefs, or promising certainty can increase mistrust and dropout.',
            refs: ['paranoid-review', 'cluster-a-review'],
          },
          {
            text: 'Cognitive, schema-focused, supportive, and metacognitive strategies may help a person examine interpretations, notice threat-focused attention, test alternatives, improve emotional regulation, and reduce retaliatory behavior. A broader schema-therapy trial included several personality disorders, but evidence should not be overstated as disorder-specific proof.',
            refs: ['schema-pd-trial', 'cluster-a-review'],
          },
        ],
      },
      {
        title: 'Medication and co-occurring conditions',
        paragraphs: [
          {
            text: 'No medication has established evidence as a specific treatment for paranoid personality disorder. Medication may be considered for co-occurring depression, anxiety, bipolar disorder, psychosis, sleep disturbance, or substance-use treatment, with clear targets and monitoring.',
            refs: ['cluster-a-review', 'personality-treatment-lancet'],
          },
          {
            text: 'Prescribing can be especially challenging when fears about control, poisoning, surveillance, or side effects are present. Shared decision-making, plain-language explanations, minimal unnecessary complexity, and a written plan may improve safety and adherence.',
            refs: ['paranoid-review'],
          },
        ],
      },
      {
        title: 'Relationships, boundaries, and safety',
        paragraphs: [
          {
            text: 'Loved ones can acknowledge fear or anger without confirming an unsupported accusation. Calm factual language, consistent boundaries, and avoiding ridicule are generally more useful than prolonged debate. Family members should also protect their own safety and seek support when conflict becomes threatening or coercive.',
            refs: ['paranoid-review'],
          },
          {
            text: 'Urgent evaluation is appropriate when suspiciousness is accompanied by a plan to harm someone, access to weapons with escalating threats, severe agitation, inability to care for basic needs, rapidly worsening psychosis, or a sudden neurological or medical change.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is paranoid personality disorder the same as schizophrenia?',
        answer: 'No. They are distinct conditions. Paranoid personality disorder is a persistent interpersonal style of mistrust, while schizophrenia involves a broader psychotic syndrome. A person can have overlapping symptoms or more than one diagnosis.',
        refs: ['dsm-5-tr', 'paranoid-review'],
      },
      {
        question: 'Can justified mistrust be mistaken for a disorder?',
        answer: 'Yes. Clinicians must consider real danger, betrayal, discrimination, culture, and trauma before labeling mistrust as pathological.',
        refs: ['who-icd11-cddr', 'dsm-5-tr'],
      },
      {
        question: 'Does medication cure paranoid personality disorder?',
        answer: 'No medication has established evidence as a cure or primary treatment. Medication may help a separate condition or a clearly defined target symptom.',
        refs: ['cluster-a-review', 'personality-treatment-lancet'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, PARANOID_REVIEW, CLUSTER_A_REVIEW, SCHEMA_PD_TRIAL, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'schizoid-personality-disorder',
    title: 'Schizoid Personality Disorder: Detachment, Differential Diagnosis, and Treatment',
    seoTitle: 'Schizoid Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to schizoid personality disorder, including social detachment, restricted expression, diagnosis, autism and depression differentials, and limited treatment evidence.',
    category: 'Personality disorders',
    cluster: 'Cluster A',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '10 min read',
    deck: 'Schizoid personality disorder describes a persistent pattern of social detachment and limited outward emotional expression. It is not simply introversion, a preference for solitude, or a synonym for schizophrenia.',
    keyPoints: [
      {
        text: 'The diagnosis involves a pervasive pattern of detachment from close relationships and restricted emotional expression, with impairment or clinically important consequences.',
        refs: ['dsm-5-tr'],
      },
      {
        text: 'Differential diagnosis should consider autism, depression, social anxiety, avoidant personality disorder, trauma, psychotic disorders, negative symptoms, and a non-pathological preference for solitude.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        text: 'Direct treatment evidence is extremely limited. Care should be person-centered and should target the individual’s own goals rather than forcing conventional sociability.',
        refs: ['cluster-a-review', 'personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What the diagnosis describes',
        paragraphs: [
          {
            text: 'Schizoid personality disorder involves a long-standing pattern of limited interest in close relationships, preference for solitary activities, restricted outward affect, and apparent indifference to praise or criticism. Some people report a rich internal life despite appearing emotionally distant to others.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'A quiet personality, independent lifestyle, a small social circle, or enjoyment of solitary hobbies is not enough for diagnosis. The clinical question is whether the pattern is inflexible, pervasive, developmentally persistent, and associated with meaningful impairment, distress, vulnerability, or inability to meet desired life goals.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Schizoid personality disorder is not schizophrenia',
        paragraphs: [
          {
            text: 'Despite the similar names, schizoid personality disorder does not require hallucinations, delusions, or disorganized thinking. Schizophrenia is a psychotic disorder with a different diagnostic structure. Clinicians still assess psychotic symptoms because social withdrawal and reduced emotional expression can also occur before, during, or after psychosis.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'Schizotypal personality disorder also differs: it includes eccentric behavior, unusual beliefs or perceptual experiences, and cognitive-perceptual distortions in addition to interpersonal difficulties. Schizoid presentations center more on detachment and limited emotional expression.',
            refs: ['dsm-5-tr', 'schizotypal-systematic-review'],
          },
        ],
      },
      {
        title: 'Autism, depression, avoidant personality, and trauma',
        paragraphs: [
          {
            text: 'Autism involves a neurodevelopmental pattern that includes differences in social communication and restricted or repetitive behavior, with evidence from early development. Depression may cause a change from prior functioning, loss of pleasure, low energy, hopelessness, and withdrawal. Neither should be inferred from surface-level social distance alone.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'Avoidant personality disorder usually includes a desire for connection constrained by fear of rejection or inadequacy. A schizoid presentation more often involves low desire for closeness, although real people may show mixed patterns. Trauma-related numbing and attachment avoidance can also resemble detachment and require a trauma-informed assessment.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Why the evidence base is thin',
        paragraphs: [
          {
            text: 'Schizoid personality disorder is under-researched. People may not seek treatment for the personality pattern itself, studies often combine several Cluster A diagnoses, and diagnostic boundaries have changed across systems. As a result, claims that one therapy or medication is proven specifically for schizoid personality disorder are not justified.',
            refs: ['cluster-a-review'],
          },
          {
            text: 'Limited evidence does not mean no one can benefit. It means treatment recommendations should be individualized, transparent about uncertainty, and evaluated by concrete outcomes such as reduced loneliness, improved work functioning, better self-care, fewer depressive symptoms, or greater capacity for chosen relationships.',
            refs: ['cluster-a-review', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Psychotherapy and practical support',
        paragraphs: [
          {
            text: 'Therapy may focus on the person’s own goals, emotional awareness, communication, social problem-solving, pleasure and motivation, trauma symptoms, or co-occurring depression and anxiety. A lower-pressure style with respect for privacy and autonomy may be more workable than immediate demands for emotional disclosure or intense group participation.',
            refs: ['personality-treatment-lancet', 'cluster-a-review'],
          },
          {
            text: 'Practical supports can matter as much as insight-oriented work. Stable housing, predictable routines, occupational support, accommodations, and connection through shared interests may improve functioning without requiring a person to become highly social.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Medication and monitoring',
        paragraphs: [
          {
            text: 'No medication has established evidence for treating schizoid personality disorder itself. Medication may be appropriate for a co-occurring depressive, anxiety, psychotic, sleep, or substance-use disorder, but it should have a clear target and be reviewed for benefit and adverse effects.',
            refs: ['cluster-a-review', 'personality-treatment-lancet'],
          },
          {
            text: 'A major clinical risk is overlooking depression, suicidality, psychosis, malnutrition, severe self-neglect, or medical illness because a person appears emotionally flat or says little. Changes from the person’s baseline deserve attention.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is schizoid personality disorder just extreme introversion?',
        answer: 'No. Introversion is a normal trait. A personality-disorder diagnosis requires a persistent and impairing pattern that cannot be explained better by another condition or context.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        question: 'Do people with schizoid personality disorder have emotions?',
        answer: 'Yes. Restricted outward expression does not prove an absence of internal emotion. Individual experiences vary considerably.',
        refs: ['dsm-5-tr'],
      },
      {
        question: 'Is there a proven medication?',
        answer: 'No medication is established for the personality disorder itself. Clinicians may treat co-occurring conditions or specific symptoms.',
        refs: ['cluster-a-review'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, CLUSTER_A_REVIEW, SCHIZOTYPAL_SYSTEMATIC_REVIEW, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'schizotypal-personality-disorder',
    title: 'Schizotypal Personality Disorder: Symptoms, Psychosis Risk, Diagnosis, and Treatment',
    seoTitle: 'Schizotypal Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to schizotypal personality disorder, unusual beliefs and perceptions, psychosis-spectrum differences, diagnosis, treatment, and the limits of evidence.',
    category: 'Personality disorders',
    cluster: 'Cluster A',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '12 min read',
    deck: 'Schizotypal personality disorder involves persistent social and interpersonal difficulties together with eccentric behavior, unusual beliefs, or perceptual and cognitive distortions. It sits close to the psychosis spectrum but is not identical to schizophrenia.',
    keyPoints: [
      {
        text: 'DSM-5-TR classifies schizotypal personality disorder in Cluster A, while ICD-11 places schizotypal disorder with schizophrenia and other primary psychotic disorders rather than in the personality-disorder section.',
        refs: ['dsm-5-tr', 'who-icd11-cddr', 'schizotypal-systematic-review'],
      },
      {
        text: 'Symptoms may include ideas of reference, unusual beliefs, odd speech, suspiciousness, constricted affect, eccentric behavior, and intense social anxiety that does not simply disappear with familiarity.',
        refs: ['dsm-5-tr', 'schizotypal-systematic-review'],
      },
      {
        text: 'Treatment evidence is limited and heterogeneous. Psychotherapy, practical support, and sometimes medication for specific target symptoms may be used, with monitoring for emerging psychosis.',
        refs: ['schizotypal-systematic-review', 'cluster-a-review'],
      },
    ],
    sections: [
      {
        title: 'Core features',
        paragraphs: [
          {
            text: 'Schizotypal personality disorder is defined by a persistent pattern of social and interpersonal deficits accompanied by discomfort with close relationships, eccentric behavior, and cognitive or perceptual distortions. Examples can include ideas of reference, magical thinking, unusual perceptual experiences, odd speech, suspiciousness, limited affect, or behavior that others experience as eccentric.',
            refs: ['dsm-5-tr', 'schizotypal-systematic-review'],
          },
          {
            text: 'Unusual spiritual, religious, or cultural beliefs are not symptoms merely because they are unfamiliar to a clinician. Assessment must consider the person’s cultural and community context, the degree of shared belief, flexibility, distress, impairment, and whether experiences occur with other signs of psychosis.',
            refs: ['who-icd11-cddr', 'dsm-5-tr'],
          },
        ],
      },
      {
        title: 'How it differs from schizophrenia',
        paragraphs: [
          {
            text: 'Schizotypal personality disorder may include brief or attenuated psychotic-like experiences, but it does not require the persistent hallucinations, delusions, disorganization, or functional decline characteristic of schizophrenia. The boundary can be difficult, and some people later develop a psychotic disorder while many do not.',
            refs: ['dsm-5-tr', 'schizotypal-systematic-review'],
          },
          {
            text: 'A clinician should assess changes in conviction, reality testing, speech organization, self-care, school or work functioning, sleep, substance use, and the duration of psychotic symptoms. Rapid deterioration, command hallucinations, severe agitation, or inability to care for basic needs requires urgent evaluation.',
            refs: ['schizotypal-systematic-review', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Classification differs across systems',
        paragraphs: [
          {
            text: 'DSM-5-TR retains schizotypal personality disorder as one of the ten named personality disorders. ICD-11 instead classifies schizotypal disorder within the schizophrenia and other primary psychotic disorders grouping. This difference reflects ongoing debate about whether the condition is best understood primarily as personality pathology or as part of the psychosis spectrum.',
            refs: ['dsm-5-tr', 'who-icd11-cddr', 'schizotypal-systematic-review'],
          },
          {
            text: 'The classification difference does not mean one system says the condition is real and the other does not. It changes how clinicians organize and code the presentation, while assessment still focuses on symptoms, severity, impairment, risk, and treatment needs.',
            refs: ['who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Differential diagnosis',
        paragraphs: [
          {
            text: 'Differential diagnosis includes schizophrenia-spectrum disorders, autism, social anxiety, paranoid personality disorder, schizoid personality disorder, OCD with poor insight, trauma-related dissociation, bipolar disorder, substance-induced symptoms, and neurological or medical causes. Developmental history and the timing of unusual experiences are especially important.',
            refs: ['dsm-5-tr', 'schizotypal-systematic-review'],
          },
          {
            text: 'Social anxiety in schizotypal presentations is often tied to suspiciousness or a sense of being fundamentally different, and may not improve simply through familiarity. In avoidant personality disorder, social inhibition is more centrally linked to fear of criticism, inadequacy, and rejection.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Psychotherapy and rehabilitation',
        paragraphs: [
          {
            text: 'The research base is modest. Treatment may include supportive psychotherapy, cognitive-behavioral strategies, social-cognitive or metacognitive work, help testing interpretations, communication and social-skills work, vocational support, and treatment of trauma, depression, anxiety, or substance use.',
            refs: ['schizotypal-systematic-review', 'cluster-a-review'],
          },
          {
            text: 'A non-shaming therapeutic style is important. Direct ridicule or confrontational attempts to strip away unusual beliefs can damage trust. Clinicians can instead explore evidence, consequences, alternative explanations, and safety while preserving the person’s dignity and autonomy.',
            refs: ['schizotypal-systematic-review'],
          },
        ],
      },
      {
        title: 'Medication and monitoring for psychosis',
        paragraphs: [
          {
            text: 'Some studies have examined low-dose antipsychotic or other medications for specific symptoms, but evidence is limited and adverse effects matter. Medication decisions should be based on defined targets such as persistent psychotic symptoms, severe anxiety, depression, or another diagnosed condition rather than the label alone.',
            refs: ['schizotypal-systematic-review', 'cluster-a-review'],
          },
          {
            text: 'Ongoing monitoring may focus on worsening suspiciousness, hallucinations, fixed delusions, functional decline, self-neglect, substance use, and suicide risk. Early intervention is especially important when symptoms shift from long-standing eccentricity toward sustained psychosis.',
            refs: ['schizotypal-systematic-review'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Does schizotypal personality disorder always become schizophrenia?',
        answer: 'No. The conditions are related, and risk is elevated compared with the general population, but progression is not inevitable.',
        refs: ['schizotypal-systematic-review'],
      },
      {
        question: 'Are unusual spiritual beliefs automatically schizotypal symptoms?',
        answer: 'No. Clinicians must evaluate culture, shared meaning, flexibility, distress, impairment, and the broader symptom pattern.',
        refs: ['who-icd11-cddr', 'dsm-5-tr'],
      },
      {
        question: 'Is there a proven treatment?',
        answer: 'Evidence is limited. Care is usually individualized and may combine psychotherapy, functional support, treatment of co-occurring disorders, and medication for specific symptoms when appropriate.',
        refs: ['schizotypal-systematic-review', 'cluster-a-review'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, SCHIZOTYPAL_SYSTEMATIC_REVIEW, CLUSTER_A_REVIEW, PERSONALITY_TREATMENT_LANCET],
  },
]
