import type { MentalHealthArticle } from './types'
import {
  AVPD_INSIGHTS,
  AVPD_REVIEW,
  DPD_REVIEW,
  DSM_5_TR,
  NICE_OCD,
  OCD_JAMA_REVIEW,
  OCPD_REVIEW,
  PERSONALITY_TREATMENT_LANCET,
  SCHEMA_PD_TRIAL,
  WHO_ICD11_CDDR,
} from './references'

const REVIEW_DATE = '2026-07-13'

export const clusterCMentalHealthArticles: MentalHealthArticle[] = [
  {
    slug: 'avoidant-personality-disorder',
    title: 'Avoidant Personality Disorder: Symptoms, Social Anxiety, Diagnosis, and Treatment',
    seoTitle: 'Avoidant Personality Disorder: Symptoms and Treatment',
    description: 'Citation-rich guide to avoidant personality disorder, including rejection sensitivity, social anxiety overlap, diagnosis, psychotherapy, exposure, and recovery.',
    category: 'Personality disorders',
    cluster: 'Cluster C',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '13 min read',
    deck: 'Avoidant personality disorder involves a pervasive pattern of social inhibition, feelings of inadequacy, and hypersensitivity to criticism or rejection. Many affected people want connection but avoid it because the anticipated cost feels overwhelming.',
    keyPoints: [
      {
        text: 'Avoidant personality disorder is more than shyness. The pattern is persistent, broad, and impairing across relationships, work, education, or other important areas.',
        refs: ['dsm-5-tr', 'avpd-review', 'avpd-insights'],
      },
      {
        text: 'Avoidant personality disorder and social anxiety disorder overlap substantially, but avoidant personality disorder generally describes a more pervasive pattern involving self-concept and relationships across contexts.',
        refs: ['avpd-review', 'avpd-insights', 'dsm-5-tr'],
      },
      {
        text: 'Psychotherapy is the main treatment. Cognitive-behavioral, schema-focused, psychodynamic, interpersonal, and exposure-based strategies may be used, but disorder-specific trial evidence remains limited.',
        refs: ['avpd-review', 'avpd-insights', 'schema-pd-trial'],
      },
      {
        text: 'Avoidance reduces anxiety in the moment but can preserve fear, loneliness, and low confidence over time. Treatment usually builds approach behavior gradually rather than forcing abrupt social exposure.',
        refs: ['avpd-review', 'avpd-insights'],
      },
    ],
    sections: [
      {
        title: 'What avoidant personality disorder looks like',
        paragraphs: [
          {
            text: 'Avoidant personality disorder is characterized by an enduring pattern of social inhibition, feelings of inadequacy, and heightened sensitivity to negative evaluation. A person may avoid jobs involving interpersonal contact, hold back in relationships until certain of acceptance, limit intimacy for fear of shame, expect criticism, or see themselves as socially inept or inferior.',
            refs: ['dsm-5-tr', 'avpd-review'],
          },
          {
            text: 'The pattern is not necessarily a lack of interest in people. Many individuals want closeness, friendship, work, or romance but anticipate rejection so strongly that withdrawal feels safer. That painful approach-avoidance conflict helps distinguish avoidant patterns from a simple preference for solitude.',
            refs: ['avpd-review', 'avpd-insights'],
          },
        ],
      },
      {
        title: 'Avoidant personality disorder versus social anxiety disorder',
        paragraphs: [
          {
            text: 'Social anxiety disorder centers on fear of scrutiny and negative evaluation in social or performance situations. Avoidant personality disorder usually describes a broader and more entrenched pattern involving identity, expectations of rejection, intimacy, occupational choices, and avoidance across much of life. In practice, the boundary is debated and the conditions frequently co-occur.',
            refs: ['avpd-review', 'avpd-insights', 'dsm-5-tr'],
          },
          {
            text: 'The label matters less than a careful formulation of what is feared, what is avoided, what the person wants, how early the pattern began, and which maintaining processes are active. Treatment can then target those processes rather than arguing over a categorical boundary.',
            refs: ['avpd-insights'],
          },
        ],
      },
      {
        title: 'How it differs from schizoid personality disorder and autism',
        paragraphs: [
          {
            text: 'Avoidant personality disorder commonly includes a desire for connection constrained by fear of rejection. Schizoid personality disorder more often involves limited desire for close relationships, although mixed presentations exist. Surface-level social withdrawal is therefore not enough to distinguish them.',
            refs: ['dsm-5-tr', 'avpd-review'],
          },
          {
            text: 'Autism is a neurodevelopmental condition involving differences in social communication and restricted or repetitive behavior, with signs rooted in development. Autistic people may also develop social anxiety or avoidant patterns after repeated rejection or masking. A clinician should not assume that eye contact, quietness, or social exhaustion proves one diagnosis.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Assessment and differential diagnosis',
        paragraphs: [
          {
            text: 'Assessment explores the duration and breadth of avoidance, self-beliefs, feared outcomes, safety behaviors, relationships, work and education, trauma, bullying, depression, substance use, eating disorders, body dysmorphic concerns, and neurodevelopmental factors. Cultural norms and experiences of discrimination can also shape caution and social behavior.',
            refs: ['dsm-5-tr', 'who-icd11-cddr', 'avpd-insights'],
          },
          {
            text: 'Depression can produce withdrawal and low self-worth, while PTSD can produce avoidance tied to trauma reminders or danger. A personality diagnosis should not be made from a temporary episode or without examining the person’s functioning over time.',
            refs: ['dsm-5-tr', 'avpd-review'],
          },
        ],
      },
      {
        title: 'Psychotherapy and graded exposure',
        paragraphs: [
          {
            text: 'Cognitive-behavioral treatment may address negative predictions, self-focused attention, post-event rumination, safety behaviors, social skills, and gradual exposure. Exposure is most useful when it tests feared predictions and reduces protective rituals rather than becoming a performance exercise aimed at feeling perfectly confident.',
            refs: ['avpd-review', 'avpd-insights'],
          },
          {
            text: 'Schema therapy may target entrenched beliefs about defectiveness, rejection, emotional deprivation, and failure. A multicenter trial of schema therapy across several personality disorders reported benefit, but the findings should not be interpreted as definitive proof for avoidant personality disorder alone.',
            refs: ['schema-pd-trial', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'The therapeutic relationship and pace of change',
        paragraphs: [
          {
            text: 'Therapy itself can activate fear of criticism, exposure, dependence, or disappointing the clinician. A collaborative pace, explicit permission to discuss shame and avoidance, and predictable feedback can reduce dropout. Excessive reassurance may feel soothing but can also preserve the belief that ordinary uncertainty is intolerable.',
            refs: ['avpd-insights', 'personality-treatment-lancet'],
          },
          {
            text: 'Progress may begin with small actions: sending a message, tolerating a pause in conversation, asking a question at work, attending a group briefly, or sharing one honest preference. The goal is not to become extroverted; it is to gain freedom to pursue valued relationships and roles despite discomfort.',
            refs: ['avpd-review', 'avpd-insights'],
          },
        ],
      },
      {
        title: 'Medication, supplements, and co-occurring conditions',
        paragraphs: [
          {
            text: 'No medication is established for avoidant personality disorder itself. Medication may be considered for a co-occurring social anxiety disorder, depression, panic disorder, PTSD, ADHD, or another independently diagnosed condition. It should be paired with functional goals rather than used as the only strategy for lifelong avoidance.',
            refs: ['avpd-review', 'personality-treatment-lancet'],
          },
          {
            text: 'No supplement has established evidence as a treatment for avoidant personality disorder. Products marketed for calm can interact with psychiatric medication, cause sedation, or become a safety behavior that a person believes must be taken before social contact.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is avoidant personality disorder just severe shyness?',
        answer: 'No. Shyness is a common trait. Avoidant personality disorder is a pervasive and impairing pattern involving self-concept, rejection sensitivity, and avoidance across important parts of life.',
        refs: ['dsm-5-tr', 'avpd-review'],
      },
      {
        question: 'Can someone have both avoidant personality disorder and social anxiety disorder?',
        answer: 'Yes. The diagnoses overlap and commonly co-occur. A clinician should focus on the person’s full pattern and treatment needs.',
        refs: ['avpd-review', 'avpd-insights'],
      },
      {
        question: 'Does exposure mean forcing someone into overwhelming situations?',
        answer: 'No. Good exposure is collaborative, graded, purposeful, and designed to build learning—not to humiliate or flood the person.',
        refs: ['avpd-insights'],
      },
      {
        question: 'Can avoidant personality disorder improve?',
        answer: 'Yes. Psychotherapy and repeated approach behavior can improve relationships, functioning, and confidence, although progress is often gradual and the evidence base is smaller than for some other conditions.',
        refs: ['avpd-review', 'schema-pd-trial'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, AVPD_REVIEW, AVPD_INSIGHTS, SCHEMA_PD_TRIAL, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'dependent-personality-disorder',
    title: 'Dependent Personality Disorder: Symptoms, Diagnosis, Relationships, and Treatment',
    seoTitle: 'Dependent Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to dependent personality disorder, including reassurance seeking, separation fears, diagnosis, culture and disability, abusive relationships, and psychotherapy.',
    category: 'Personality disorders',
    cluster: 'Cluster C',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '12 min read',
    deck: 'Dependent personality disorder involves a pervasive and excessive need to be cared for that leads to submissive, clinging behavior and fears of separation. Needing help, living with disability, or relying on family is not automatically pathological.',
    keyPoints: [
      {
        text: 'The diagnosis concerns an inflexible pattern of difficulty making decisions or functioning independently, not ordinary interdependence or culturally expected family closeness.',
        refs: ['dsm-5-tr', 'dpd-review', 'who-icd11-cddr'],
      },
      {
        text: 'People may surrender preferences, seek repeated reassurance, fear disagreement, struggle to initiate tasks alone, or urgently seek another caregiving relationship after one ends.',
        refs: ['dsm-5-tr', 'dpd-review'],
      },
      {
        text: 'Assessment must distinguish personality pathology from disability-related support needs, coercive control, trauma, depression, anxiety, medical illness, and realistic financial or caregiving dependence.',
        refs: ['dpd-review', 'who-icd11-cddr'],
      },
      {
        text: 'Psychotherapy typically aims to strengthen agency, decision-making, boundaries, and tolerance of separation without abruptly withdrawing support or creating a new dependency on the therapist.',
        refs: ['dpd-review', 'personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What dependent personality disorder looks like',
        paragraphs: [
          {
            text: 'Dependent personality disorder is characterized by a persistent and excessive need to be cared for, accompanied by submissive or clinging behavior and fears of separation. A person may need extensive advice before routine decisions, rely on others to assume responsibility, avoid disagreement, have difficulty starting projects alone, or feel helpless when by themselves.',
            refs: ['dsm-5-tr', 'dpd-review'],
          },
          {
            text: 'Human beings are interdependent, and dependence is not inherently unhealthy. The clinical issue is whether the pattern is rigid, broad, disproportionate to the situation, and associated with impaired autonomy, exploitative relationships, major distress, or inability to carry out desired roles.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Culture, disability, illness, and practical dependence',
        paragraphs: [
          {
            text: 'Family-centered decision-making, multigenerational living, shared finances, and deference to elders may be culturally normative. A diagnosis should not impose an individualistic ideal of independence or treat culturally expected support as evidence of illness.',
            refs: ['who-icd11-cddr', 'dsm-5-tr'],
          },
          {
            text: 'Physical disability, chronic illness, cognitive impairment, poverty, immigration status, childcare needs, and lack of transportation can create genuine reliance on others. The assessment should distinguish practical support needs from fear-driven surrender of agency and should identify accommodations rather than pathologizing dependence that is realistic.',
            refs: ['dpd-review', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Abusive and coercive relationships',
        paragraphs: [
          {
            text: 'A dependent pattern can increase vulnerability to exploitation because a person may tolerate mistreatment to avoid abandonment. At the same time, coercive control can make anyone appear passive, indecisive, or dependent by restricting money, transportation, social contact, work, sleep, or access to documents.',
            refs: ['dpd-review'],
          },
          {
            text: 'Clinicians should assess safety privately and avoid interpreting survival behavior as consent or personality. When there is abuse, safety planning, legal support, housing, financial assistance, and domestic-violence services may take priority over personality-focused therapy.',
            refs: ['who-icd11-cddr', 'dpd-review'],
          },
        ],
      },
      {
        title: 'Differential diagnosis and overlap',
        paragraphs: [
          {
            text: 'Separation anxiety disorder, agoraphobia, depression, generalized anxiety, PTSD, borderline personality disorder, avoidant personality disorder, and medical or neurocognitive conditions can all involve reassurance seeking or difficulty being alone. The timeline, feared consequences, identity, relationship pattern, and level of practical capacity help clarify the picture.',
            refs: ['dsm-5-tr', 'dpd-review'],
          },
          {
            text: 'Borderline personality disorder may include intense abandonment fears, but it usually also involves marked emotional instability, identity disturbance, impulsivity, self-harm, anger, or unstable idealization and devaluation. Dependent personality disorder is more consistently organized around obtaining and preserving care and guidance.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Psychotherapy without creating another dependency',
        paragraphs: [
          {
            text: 'Therapy may use cognitive-behavioral, psychodynamic, schema-focused, interpersonal, or skills-based methods to build decision-making, assertiveness, self-efficacy, emotional regulation, and realistic tolerance of disagreement or separation. Behavioral experiments can gradually shift responsibility back to the person.',
            refs: ['dpd-review', 'personality-treatment-lancet'],
          },
          {
            text: 'The therapeutic relationship needs careful boundaries. A clinician who makes every decision or becomes endlessly available can unintentionally reinforce the pattern. Abruptly withholding support can be equally harmful. A better approach combines warmth with a planned transfer of choice and responsibility.',
            refs: ['dpd-review', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Practical steps that support autonomy',
        paragraphs: [
          {
            text: 'Useful goals may include making one low-stakes decision without reassurance, expressing a preference, learning a practical skill, managing a small budget, attending an appointment independently, reconnecting with supportive people, or creating a safety plan for time alone. Goals should match the person’s actual abilities and circumstances.',
            refs: ['dpd-review'],
          },
          {
            text: 'Healthy autonomy does not mean never relying on anyone. It means having more choice, a broader support network, and the ability to seek help without automatically surrendering one’s values, safety, or decision-making power.',
            refs: ['dpd-review', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Medication and prognosis',
        paragraphs: [
          {
            text: 'No medication is established for dependent personality disorder itself. Medication may treat co-occurring depression, anxiety, panic, PTSD, ADHD, sleep problems, or another diagnosed condition. Sedatives deserve particular caution when fear of coping alone or reassurance-seeking is prominent.',
            refs: ['personality-treatment-lancet', 'dpd-review'],
          },
          {
            text: 'Change is possible. Progress is often measured through increased agency, safer relationships, greater tolerance of uncertainty and disagreement, and improved practical functioning rather than complete emotional independence.',
            refs: ['dpd-review', 'personality-treatment-lancet'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is relying on family a sign of dependent personality disorder?',
        answer: 'Not by itself. Diagnosis requires a pervasive, inflexible, and impairing pattern assessed in cultural, medical, financial, and relational context.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        question: 'Can an abusive relationship create dependent-looking behavior?',
        answer: 'Yes. Coercive control can restrict autonomy and make survival behavior look like a fixed personality trait. Safety assessment is essential.',
        refs: ['dpd-review'],
      },
      {
        question: 'What is the goal of therapy?',
        answer: 'The goal is usually greater agency, decision-making, assertiveness, and safer interdependence—not forcing a person to handle everything alone.',
        refs: ['dpd-review', 'personality-treatment-lancet'],
      },
      {
        question: 'Is medication a treatment for dependent personality disorder?',
        answer: 'No medication is established for the disorder itself. Medication may be appropriate for a separate, co-occurring condition.',
        refs: ['personality-treatment-lancet'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, DPD_REVIEW, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'obsessive-compulsive-personality-disorder',
    title: 'Obsessive-Compulsive Personality Disorder (OCPD): Perfectionism, Control, OCD Differences, and Treatment',
    seoTitle: 'OCPD: Perfectionism, Control and OCD Differences',
    description: 'Citation-rich guide to obsessive-compulsive personality disorder, including perfectionism, rigidity, control, diagnosis, OCPD versus OCD, treatment, and prognosis.',
    category: 'Personality disorders',
    cluster: 'Cluster C',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '14 min read',
    deck: 'Obsessive-compulsive personality disorder is a pervasive pattern of perfectionism, control, and rigidity that can interfere with flexibility, relationships, and completing tasks. Despite the similar name, OCPD is not the same condition as OCD.',
    keyPoints: [
      {
        text: 'OCPD centers on an enduring personality pattern of perfectionism, order, control, and inflexibility; OCD centers on unwanted obsessions and compulsions.',
        refs: ['dsm-5-tr', 'ocpd-review', 'ocd-jama-review'],
      },
      {
        text: 'OCPD traits may feel correct, necessary, or consistent with the person’s standards, although the consequences can still cause distress. OCD symptoms are more often experienced as intrusive or unwanted.',
        refs: ['dsm-5-tr', 'ocpd-review'],
      },
      {
        text: 'Psychotherapy is the main treatment. Cognitive, schema-focused, psychodynamic, and interpersonal approaches may target rigidity, perfectionism, emotional avoidance, and relationship patterns, but disorder-specific evidence is limited.',
        refs: ['ocpd-review', 'schema-pd-trial', 'personality-treatment-lancet'],
      },
      {
        text: 'No medication or supplement is established for OCPD itself. Clinicians may treat co-occurring OCD, depression, anxiety, ADHD, eating disorders, or another diagnosed condition.',
        refs: ['ocpd-review', 'personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What OCPD looks like',
        paragraphs: [
          {
            text: 'Obsessive-compulsive personality disorder involves a pervasive pattern of preoccupation with orderliness, perfectionism, and mental or interpersonal control at the expense of flexibility, openness, and efficiency. Features may include excessive focus on rules and lists, perfectionism that delays completion, overdevotion to work, rigidity about morality, difficulty discarding items, reluctance to delegate, miserliness, and stubbornness.',
            refs: ['dsm-5-tr', 'ocpd-review'],
          },
          {
            text: 'Being conscientious, organized, hardworking, frugal, or principled is not automatically pathological. The concern is a rigid pattern that repeatedly undermines deadlines, relationships, rest, delegation, health, or the person’s own goals.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'OCPD versus OCD: the crucial distinction',
        paragraphs: [
          {
            text: 'OCD involves obsessions, compulsions, or both. Obsessions are unwanted intrusive thoughts, images, urges, or doubts, and compulsions are behaviors or mental acts performed to reduce distress or prevent a feared outcome. OCPD is a broader personality pattern involving perfectionism, control, and rigidity across many areas of life.',
            refs: ['dsm-5-tr', 'ocd-jama-review', 'nice-ocd'],
          },
          {
            text: 'People with OCD often recognize that a ritual is excessive or wish they could stop, although insight varies. OCPD traits may be more ego-syntonic: the standards or rules can feel justified, responsible, or necessary, while other people experience them as inflexible or controlling. A person can meet criteria for both conditions.',
            refs: ['dsm-5-tr', 'ocpd-review'],
          },
        ],
      },
      {
        title: 'How perfectionism becomes impairing',
        paragraphs: [
          {
            text: 'Maladaptive perfectionism can create repeated checking, rewriting, overpreparing, difficulty deciding, procrastination, or inability to finish because the result never feels good enough. The person may work far longer than necessary while producing less, then interpret exhaustion or delay as proof that even more control is needed.',
            refs: ['ocpd-review'],
          },
          {
            text: 'In relationships, the pattern may appear as micromanaging, correcting, moralizing, difficulty compromising, controlling shared routines, or judging others by rigid standards. These behaviors can be harmful even when the person believes they are preventing mistakes or protecting the family.',
            refs: ['ocpd-review', 'dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Differential diagnosis and overlap',
        paragraphs: [
          {
            text: 'Clinicians distinguish OCPD from OCD, autism, ADHD compensation, generalized anxiety, eating disorders, hoarding disorder, depression, trauma-related control, and culturally or occupationally reinforced standards. The pattern must be broad and enduring rather than limited to one job, crisis, or symptom theme.',
            refs: ['dsm-5-tr', 'ocpd-review'],
          },
          {
            text: 'Autism can involve routines, focused interests, sensory needs, and difficulty with unexpected change rooted in neurodevelopment. ADHD can lead a person to overbuild systems to compensate for forgetfulness or inconsistency. Neither should be relabeled as OCPD from organization or rigidity alone.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Psychotherapy and behavioral change',
        paragraphs: [
          {
            text: 'Treatment may help a person identify the costs of rigid standards, tolerate uncertainty and delegation, complete tasks at a good-enough level, broaden emotional awareness, and communicate preferences without turning them into rules for everyone. Cognitive and behavioral methods can test predictions about mistakes, efficiency, responsibility, and loss of control.',
            refs: ['ocpd-review', 'personality-treatment-lancet'],
          },
          {
            text: 'Schema-focused and psychodynamic approaches may examine overcontrol, unrelenting standards, punitive self-criticism, emotional inhibition, and relationship templates. A schema-therapy trial across personality disorders is encouraging, but it does not establish a single definitive treatment specifically for OCPD.',
            refs: ['schema-pd-trial', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Working with insight and motivation',
        paragraphs: [
          {
            text: 'People may seek treatment for burnout, anxiety, depression, conflict, or a partner’s ultimatum rather than for perfectionism itself. Therapy is more collaborative when it starts with the person’s own goals—finishing work, sleeping, reducing arguments, parenting more flexibly, or tolerating help—rather than demanding that they abandon all standards.',
            refs: ['ocpd-review'],
          },
          {
            text: 'The clinician must avoid reenacting a contest over who is correct. Clear goals, measurable experiments, respectful feedback, and attention to the therapy relationship can make rigidity visible without turning treatment into another perfectionistic project.',
            refs: ['ocpd-review', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Medication, supplements, and prognosis',
        paragraphs: [
          {
            text: 'No medication is established for OCPD itself. Medication may be appropriate for co-occurring OCD, depression, anxiety, ADHD, bipolar disorder, eating disorders, or sleep problems. If OCD is present, evidence-based OCD treatment such as ERP and an SSRI may be considered separately.',
            refs: ['ocpd-review', 'nice-ocd', 'ocd-jama-review'],
          },
          {
            text: 'No supplement has established evidence as a treatment for OCPD. Change is possible, especially when treatment links flexibility to outcomes the person values. Improvement may look like finishing tasks sooner, delegating, tolerating disagreement, resting without guilt, and treating mistakes as information rather than catastrophe.',
            refs: ['ocpd-review', 'personality-treatment-lancet'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is OCPD the same as OCD?',
        answer: 'No. OCD involves obsessions and compulsions. OCPD is an enduring personality pattern of perfectionism, control, and rigidity. A person can have either one or both.',
        refs: ['dsm-5-tr', 'ocpd-review', 'ocd-jama-review'],
      },
      {
        question: 'Does being organized mean someone has OCPD?',
        answer: 'No. Organization is often useful. Diagnosis requires a pervasive, inflexible pattern that causes meaningful impairment, conflict, distress, or inefficiency.',
        refs: ['dsm-5-tr'],
      },
      {
        question: 'What therapy treats OCPD?',
        answer: 'Clinicians may use cognitive-behavioral, schema-focused, psychodynamic, or interpersonal approaches. The disorder-specific evidence base is limited, so treatment should be individualized and measured by functional outcomes.',
        refs: ['ocpd-review', 'schema-pd-trial'],
      },
      {
        question: 'Can medication treat OCPD?',
        answer: 'No medication is established for OCPD itself. Medication may treat a separate co-occurring condition, including OCD when it is independently present.',
        refs: ['ocpd-review', 'nice-ocd'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, OCPD_REVIEW, OCD_JAMA_REVIEW, NICE_OCD, SCHEMA_PD_TRIAL, PERSONALITY_TREATMENT_LANCET],
  },
]
