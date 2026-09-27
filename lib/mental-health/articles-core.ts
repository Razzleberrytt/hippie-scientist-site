import type { MentalHealthArticle } from './types'
import {
  AMPD_REVIEW,
  BPD_JAMA_REVIEW,
  BPD_META_ANALYSIS,
  BPD_PHARM_COCHRANE,
  BPD_PSYCH_COCHRANE,
  AVPD_ATTACHMENT_EIKENAES,
  AVPD_INSIGHTS,
  AVPD_REVIEW,
  BPD_ATTACHMENT_META_SMITH,
  BPD_AVPD_DYAD_BEENEY,
  BPD_AVPD_INTERPERSONAL_MCCLOSKEY,
  BPD_COUPLE_STABILITY_BOUCHARD,
  BPD_PARTNER_REVIEW_GREER,
  BPD_ROMANTIC_REVIEW_NAVARRO,
  BPD_SIGNIFICANT_OTHERS_FITZPATRICK,
  BPD_SUCCESSFUL_COUPLES_MOLYNEUX,
  DSM_5_TR,
  ICD11_PD_REVIEW,
  NICE_BPD,
  NICE_OCD,
  NIMH_BPD,
  NIMH_OCD,
  OCD_ERP_REVIEW,
  OCD_JAMA_REVIEW,
  OCD_NETWORK_META,
  OCD_POTS_TRIAL,
  OCD_PRIMER,
  PERSONALITY_TREATMENT_LANCET,
  WHO_ICD11_CDDR,
} from './references'

const REVIEW_DATE = '2026-07-13'

export const coreMentalHealthArticles: MentalHealthArticle[] = [
  {
    slug: 'personality-disorders-overview',
    title: 'Personality Disorders: Types, Diagnosis, Treatment, and the DSM-5-TR vs ICD-11',
    seoTitle: 'Personality Disorders: Types, Diagnosis and Treatment',
    description: 'A citation-rich guide to personality disorders, including DSM-5-TR clusters, the ICD-11 dimensional model, diagnosis, treatment, prognosis, and common misconceptions.',
    category: 'Personality disorders',
    cluster: 'Overview',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '14 min read',
    deck: 'Personality disorders are not simply difficult traits or moral failings. They are enduring patterns of inner experience and behavior that create substantial impairment, distress, or risk across important parts of life.',
    keyPoints: [
      {
        text: 'A personality-disorder diagnosis requires a persistent, inflexible pattern that affects functioning across contexts; one conflict, one bad relationship, or a social-media checklist is not enough.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        text: 'DSM-5-TR retains ten named personality disorders grouped into Clusters A, B, and C, while ICD-11 primarily rates severity and prominent trait domains.',
        refs: ['dsm-5-tr', 'who-icd11-cddr', 'icd11-pd-review'],
      },
      {
        text: 'Psychotherapy is the main treatment approach. Medication may be useful for co-occurring depression, anxiety, psychosis, sleep problems, or other target symptoms, but it is not a stand-alone cure for a personality disorder.',
        refs: ['personality-treatment-lancet'],
      },
      {
        text: 'People can improve substantially. Symptoms, relationships, self-understanding, and daily functioning may change over time, especially with sustained, well-matched care.',
        refs: ['personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What is a personality disorder?',
        paragraphs: [
          {
            text: 'Personality refers to relatively stable ways of perceiving, feeling, relating, and behaving. A personality disorder is considered when these patterns are enduring, inflexible, markedly different from cultural expectations, and associated with clinically significant impairment or distress. The pattern must be broad enough to affect more than one isolated situation and must not be better explained by another mental disorder, a substance, medication, or medical condition.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
          {
            text: 'Having traits associated with a disorder does not automatically mean someone has the disorder. Perfectionism is not automatically obsessive-compulsive personality disorder, social discomfort is not automatically avoidant personality disorder, and selfish behavior is not automatically narcissistic personality disorder. Diagnosis depends on severity, persistence, context, functional impact, and careful differential assessment.',
            refs: ['dsm-5-tr', 'ampd-review'],
          },
        ],
      },
      {
        title: 'The ten DSM-5-TR personality disorders',
        paragraphs: [
          {
            text: 'DSM-5-TR retains a categorical model with ten named personality disorders. The cluster system is a memory aid, not a biological map, and considerable overlap exists both between disorders and with other psychiatric conditions.',
            refs: ['dsm-5-tr', 'ampd-review'],
          },
        ],
        bullets: [
          { text: 'Cluster A, often described as odd or eccentric: paranoid, schizoid, and schizotypal personality disorders.', refs: ['dsm-5-tr'] },
          { text: 'Cluster B, often described as dramatic, emotional, or erratic: antisocial, borderline, histrionic, and narcissistic personality disorders.', refs: ['dsm-5-tr'] },
          { text: 'Cluster C, often described as anxious or fearful: avoidant, dependent, and obsessive-compulsive personality disorders.', refs: ['dsm-5-tr'] },
        ],
      },
      {
        title: 'How ICD-11 differs from the DSM cluster model',
        paragraphs: [
          {
            text: 'ICD-11 moved away from most separate personality-disorder categories. It first asks whether a personality disturbance is present and then rates its severity. Clinicians can add trait qualifiers such as negative affectivity, detachment, dissociality, disinhibition, and anankastia, along with a borderline-pattern qualifier when appropriate.',
            refs: ['who-icd11-cddr', 'icd11-pd-review'],
          },
          {
            text: 'The dimensional approach reflects the reality that personality pathology often crosses category boundaries. Two people with the same named DSM diagnosis can look quite different, while two people with different labels may share important traits and treatment needs. Neither framework should be used as a personality test or identity verdict.',
            refs: ['ampd-review', 'icd11-pd-review'],
          },
        ],
      },
      {
        title: 'How clinicians diagnose personality disorders',
        paragraphs: [
          {
            text: 'A sound assessment usually includes a detailed history, examples across several settings, the timeline of symptoms, relationship and work functioning, trauma and developmental history, substance use, medical factors, and collateral information when appropriate and consented to. Structured or semi-structured diagnostic interviews can improve reliability, but clinical judgment remains necessary.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
          {
            text: 'Differential diagnosis is essential. Mood episodes, PTSD, autism, ADHD, psychotic disorders, substance effects, neurological conditions, and acute stress can all produce patterns that resemble personality pathology. Clinicians also need to consider culture, discrimination, environment, and whether a behavior is adaptive in a dangerous setting rather than evidence of a fixed disorder.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'What causes personality disorders?',
        paragraphs: [
          {
            text: 'There is no single cause. Contemporary models describe interactions among temperament, genetic vulnerability, attachment and learning history, adversity or trauma, family and peer environments, neurodevelopment, and social context. Risk factors are not destiny, and a diagnosis cannot reveal exactly what happened in a person’s childhood.',
            refs: ['personality-treatment-lancet', 'dsm-5-tr'],
          },
          {
            text: 'It is also inaccurate to assume that everyone with a personality disorder experienced abuse or that everyone who experienced abuse develops one. Similar outward behaviors can arise through different pathways, which is one reason individualized assessment matters.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Treatment: what has evidence and what does not',
        paragraphs: [
          {
            text: 'Psychotherapy is the central treatment. Depending on the presentation, clinicians may use structured approaches such as dialectical behavior therapy, mentalization-based therapy, schema therapy, cognitive-behavioral approaches, transference-focused psychotherapy, or good psychiatric management. The strongest disorder-specific evidence is for borderline personality disorder; evidence for several other personality disorders remains much thinner.',
            refs: ['personality-treatment-lancet'],
          },
          {
            text: 'Medication is generally used to treat co-occurring disorders or clearly defined target symptoms rather than the personality disorder as a whole. Polypharmacy can add adverse effects and confusion without addressing the underlying interpersonal, emotional, or behavioral patterns. Treatment plans should include measurable goals, periodic review, and a clear reason for every medication.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Prognosis, recovery, and stigma',
        paragraphs: [
          {
            text: 'Personality disorders are often described as enduring, but enduring does not mean untreatable or unchangeable. Many people experience meaningful reductions in symptoms and risk, improved relationships, greater occupational stability, and better quality of life. Progress may be uneven and often depends on treatment engagement, safety, social conditions, and co-occurring disorders.',
            refs: ['personality-treatment-lancet'],
          },
          {
            text: 'Stigmatizing labels such as toxic, evil, manipulative, attention-seeking, or incapable of empathy are not clinical formulations. They can hide risk, discourage treatment, and reduce a complex person to their hardest moments. Accountability for harmful behavior and compassion for a treatable condition can coexist.',
            refs: ['who-icd11-cddr', 'personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'When urgent help is needed',
        paragraphs: [
          {
            text: 'Urgent evaluation is warranted when there is imminent risk of suicide or serious self-harm, threats or plans to harm someone else, severe intoxication or withdrawal, inability to care for basic needs, rapidly worsening psychosis, or a sudden major change from the person’s usual functioning. In the United States, call or text 988 for crisis support and call 911 for an immediate life-threatening emergency.',
            refs: ['nimh-bpd'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Can someone have traits without having a personality disorder?',
        answer: 'Yes. Traits exist on continua. A disorder requires a persistent pattern with significant impairment, distress, or risk, assessed in context by a qualified clinician.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        question: 'Can a person have more than one personality disorder?',
        answer: 'Yes. Overlap is common, and dimensional models were partly developed to describe mixed presentations more accurately.',
        refs: ['dsm-5-tr', 'icd11-pd-review'],
      },
      {
        question: 'Are personality disorders permanent?',
        answer: 'They can be long-lasting, but symptoms and functioning often improve. A diagnosis should never be treated as a life sentence.',
        refs: ['personality-treatment-lancet'],
      },
      {
        question: 'Do supplements treat personality disorders?',
        answer: 'No supplement has established evidence as a treatment for a personality disorder itself. Supplements may also interact with psychiatric medications, so they should not replace evidence-based care.',
        refs: ['personality-treatment-lancet'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, ICD11_PD_REVIEW, AMPD_REVIEW, PERSONALITY_TREATMENT_LANCET, NIMH_BPD],
  },
  {
    slug: 'obsessive-compulsive-disorder',
    title: 'Obsessive-Compulsive Disorder (OCD): Intrusive Thoughts, Compulsions, Diagnosis, and Treatment',
    seoTitle: 'OCD: Symptoms, Intrusive Thoughts and Treatment',
    description: 'Evidence-based guide to OCD symptoms, intrusive thoughts, mental compulsions, diagnosis, ERP, SSRIs, treatment resistance, and the difference between OCD and OCPD.',
    category: 'OCD',
    cluster: 'Overview',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '16 min read',
    deck: 'OCD is more than neatness or handwashing. It involves obsessions, compulsions, or both, with symptoms that are time-consuming, distressing, or disruptive to daily life.',
    keyPoints: [
      {
        text: 'Obsessions are unwanted, recurring thoughts, images, urges, or doubts; compulsions are behaviors or mental acts performed to reduce distress or prevent a feared outcome.',
        refs: ['nimh-ocd', 'dsm-5-tr', 'ocd-jama-review'],
      },
      {
        text: 'Intrusive thoughts do not equal intent, character, or hidden desire. People with OCD are often distressed precisely because the thought conflicts with their values.',
        refs: ['ocd-jama-review', 'ocd-primer'],
      },
      {
        text: 'Exposure and response prevention, a specialized form of cognitive-behavioral therapy, is a first-line psychological treatment. SSRIs are also evidence-based and may be combined with therapy depending on severity and preference.',
        refs: ['nice-ocd', 'ocd-network-meta', 'ocd-erp-review'],
      },
      {
        text: 'OCD and obsessive-compulsive personality disorder are different conditions. OCD centers on obsessions and compulsions; OCPD centers on a pervasive pattern of perfectionism, control, and rigidity.',
        refs: ['dsm-5-tr'],
      },
    ],
    sections: [
      {
        title: 'What OCD actually is',
        paragraphs: [
          {
            text: 'Obsessive-compulsive disorder is marked by obsessions, compulsions, or both. Obsessions are recurrent and intrusive thoughts, images, urges, or doubts that are experienced as unwanted. Compulsions are repetitive behaviors or mental acts performed according to rigid rules or in response to an obsession. The cycle typically brings short-term relief but strengthens the disorder over time.',
            refs: ['nimh-ocd', 'dsm-5-tr', 'ocd-primer'],
          },
          {
            text: 'The content of OCD can involve contamination, accidental harm, morality, religion, sexuality, relationships, health, identity, symmetry, responsibility, or fears of losing control. The theme does not determine whether it is OCD; the pattern of intrusion, distress, ritualizing, avoidance, and functional impairment is more important.',
            refs: ['ocd-jama-review', 'ocd-primer'],
          },
        ],
      },
      {
        title: 'Compulsions can be visible or entirely mental',
        paragraphs: [
          {
            text: 'Common visible compulsions include washing, checking, repeating, arranging, rereading, asking for reassurance, confessing, and avoiding triggers. Mental compulsions may include reviewing memories, analyzing feelings, replacing a bad thought with a good one, silently praying, counting, testing attraction, or repeatedly trying to prove certainty.',
            refs: ['ocd-jama-review', 'ocd-erp-review'],
          },
          {
            text: 'So-called Pure O is not a separate formal diagnosis and usually is not truly compulsion-free. The rituals are often covert, such as rumination, mental review, neutralizing, reassurance seeking, or internet research. Recognizing these responses is important because treatment targets the full obsession-compulsion cycle, not only observable behavior.',
            refs: ['dsm-5-tr', 'ocd-erp-review'],
          },
        ],
      },
      {
        title: 'Intrusive thoughts are not intentions',
        paragraphs: [
          {
            text: 'OCD may attach to a person’s deepest values and produce thoughts that feel shocking, shameful, or dangerous. The presence of an intrusive thought does not demonstrate intent or predict action. Repeatedly checking whether the thought means something, however, can become a compulsion that keeps the doubt alive.',
            refs: ['ocd-jama-review', 'ocd-primer'],
          },
          {
            text: 'A clinician still assesses actual safety rather than assuming every disturbing thought is OCD. The distinction depends on context, desire versus fear, planning, behavioral history, insight, and the overall symptom pattern. When there is genuine intent, a plan, or immediate danger, urgent help is appropriate.',
            refs: ['dsm-5-tr', 'ocd-jama-review'],
          },
        ],
      },
      {
        title: 'How OCD is diagnosed',
        paragraphs: [
          {
            text: 'Diagnosis considers the nature of obsessions and compulsions, the time they consume, the distress or impairment they cause, insight, avoidance, family accommodation, onset, and co-occurring conditions. The Yale-Brown Obsessive Compulsive Scale is commonly used to measure severity, but a score alone does not replace a diagnostic interview.',
            refs: ['ocd-jama-review', 'ocd-primer'],
          },
          {
            text: 'Differential diagnosis may include generalized anxiety, depression with rumination, PTSD, illness anxiety disorder, body dysmorphic disorder, eating disorders, tic disorders, psychotic disorders, autism-related routines, and obsessive-compulsive personality disorder. More than one condition can be present at the same time.',
            refs: ['dsm-5-tr', 'ocd-jama-review'],
          },
        ],
      },
      {
        title: 'Exposure and response prevention (ERP)',
        paragraphs: [
          {
            text: 'ERP helps a person gradually approach feared situations, thoughts, images, sensations, or uncertainty while reducing the compulsive response. The goal is not to prove that nothing bad will ever happen. It is to learn that distress and uncertainty can be tolerated without rituals and that feared predictions often do not function the way OCD claims.',
            refs: ['nice-ocd', 'ocd-erp-review'],
          },
          {
            text: 'Good ERP is collaborative, planned, and tailored. It is not flooding, humiliation, or forcing someone into unsafe situations. Treatment commonly includes psychoeducation, a hierarchy, repeated practice, attention to covert rituals, relapse planning, and work with family members when reassurance or accommodation has become part of the cycle.',
            refs: ['ocd-erp-review', 'nice-ocd'],
          },
        ],
      },
      {
        title: 'Medication and combined treatment',
        paragraphs: [
          {
            text: 'Selective serotonin reuptake inhibitors are established medication options for OCD. Clomipramine is also effective but generally has a less favorable adverse-effect burden. Medication decisions require clinician supervision because OCD treatment may involve different dosing and response timelines than treatment for depression, and abrupt changes can cause harm.',
            refs: ['nice-ocd', 'ocd-network-meta', 'ocd-jama-review'],
          },
          {
            text: 'For children and adolescents, cognitive-behavioral therapy with ERP, an SSRI, or their combination may be considered according to severity, access, response, and family preference. Pediatric prescribing requires age-appropriate monitoring, especially during initiation and dose changes.',
            refs: ['ocd-pots-trial', 'nice-ocd'],
          },
        ],
      },
      {
        title: 'When first treatment is not enough',
        paragraphs: [
          {
            text: 'A partial response does not necessarily mean OCD is untreatable. Clinicians first examine whether ERP was sufficiently specific and intensive, whether hidden rituals or avoidance remain, whether medication was taken consistently for an adequate trial, and whether depression, tics, substance use, trauma, or family accommodation are interfering.',
            refs: ['ocd-jama-review', 'ocd-primer'],
          },
          {
            text: 'Specialist options may include more intensive ERP, medication optimization, carefully selected augmentation, or neuromodulation for severe treatment-resistant cases. These decisions belong in specialty care because the balance of evidence, adverse effects, and patient selection becomes more complex.',
            refs: ['nimh-ocd', 'ocd-jama-review', 'ocd-primer'],
          },
        ],
      },
      {
        title: 'Self-help, reassurance, and supplements',
        paragraphs: [
          {
            text: 'Evidence-based self-help can support treatment, especially when it follows ERP principles. Endless symptom checking, repeated online testing, asking others for certainty, or repeatedly asking an AI whether a feared thought means danger can function as reassurance compulsions even when they feel like research.',
            refs: ['ocd-erp-review'],
          },
          {
            text: 'No herb or supplement should be presented as a replacement for ERP, psychiatric evaluation, or evidence-based medication. Supplements can interact with antidepressants and other psychiatric drugs, and products marketed for calm may inadvertently reinforce avoidance if they are used as a ritual that must occur before facing a trigger.',
            refs: ['nice-ocd', 'ocd-jama-review'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Does having a violent or sexual intrusive thought mean I want it?',
        answer: 'No. Intrusive thoughts are not equivalent to intention. OCD often targets subjects that matter deeply to the person. A clinician can assess the pattern and any genuine safety concerns without treating the thought itself as proof.',
        refs: ['ocd-jama-review', 'ocd-primer'],
      },
      {
        question: 'Can compulsions happen only in the mind?',
        answer: 'Yes. Rumination, reviewing, counting, neutralizing, praying, testing feelings, and seeking internal certainty can all function as mental compulsions.',
        refs: ['ocd-erp-review'],
      },
      {
        question: 'Is OCD the same as being a perfectionist?',
        answer: 'No. Perfectionism may appear in OCD, OCPD, anxiety, eating disorders, or no disorder at all. OCD specifically involves obsessions and/or compulsions that cause significant distress or impairment.',
        refs: ['dsm-5-tr'],
      },
      {
        question: 'What therapy should I look for?',
        answer: 'Look for a licensed clinician with specific training and experience in cognitive-behavioral therapy with exposure and response prevention for OCD.',
        refs: ['nice-ocd', 'ocd-erp-review'],
      },
    ],
    references: [DSM_5_TR, NIMH_OCD, NICE_OCD, OCD_JAMA_REVIEW, OCD_PRIMER, OCD_NETWORK_META, OCD_ERP_REVIEW, OCD_POTS_TRIAL],
  },
  {
    slug: 'borderline-personality-disorder',
    title: 'Borderline Personality Disorder (BPD): Symptoms, Diagnosis, Treatment, and Recovery',
    seoTitle: 'BPD: Symptoms, Diagnosis, Treatment and Recovery',
    description: 'Citation-rich guide to borderline personality disorder, including emotional dysregulation, relationships, self-image, differential diagnosis, DBT, medications, safety, and recovery.',
    category: 'Personality disorders',
    cluster: 'Cluster B',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '17 min read',
    deck: 'BPD is a serious but treatable condition involving difficulties with emotion regulation, identity, relationships, and impulse control. It is not a synonym for abusive, manipulative, or impossible to help.',
    keyPoints: [
      {
        text: 'BPD is defined by a persistent pattern involving instability in emotions, self-image, relationships, and behavior; presentations vary widely from person to person.',
        refs: ['nimh-bpd', 'dsm-5-tr', 'bpd-jama-review'],
      },
      {
        text: 'Self-harm and suicidal behavior require direct, compassionate assessment. They should never be dismissed as attention-seeking.',
        refs: ['nimh-bpd', 'bpd-jama-review'],
      },
      {
        text: 'Structured psychotherapy is the primary treatment. DBT, mentalization-based treatment, schema therapy, transference-focused psychotherapy, and generalist approaches all have evidence or guideline support, although study quality and effect sizes vary.',
        refs: ['nice-bpd', 'bpd-psych-cochrane', 'bpd-meta-analysis'],
      },
      {
        text: 'Medication may target a co-occurring disorder or a specific short-term symptom, but evidence does not support medication as the primary treatment for the core disorder.',
        refs: ['nice-bpd', 'bpd-pharm-cochrane'],
      },
    ],
    sections: [
      {
        title: 'What BPD is—and what it is not',
        paragraphs: [
          {
            text: 'Borderline personality disorder affects emotion regulation, impulse control, identity, and relationships. A person may experience intense emotional reactions, rapid shifts in how they view themselves or others, strong sensitivity to rejection or abandonment, chronic emptiness, anger, dissociation, impulsive behavior, or recurrent self-harm. Not every person has every feature, and severity can change over time.',
            refs: ['nimh-bpd', 'dsm-5-tr', 'bpd-jama-review'],
          },
          {
            text: 'BPD does not mean someone has two personalities, and it is not interchangeable with bipolar disorder. It also does not establish that a person is intentionally manipulative, abusive, dishonest, or incapable of love. Harmful behavior still requires accountability, but a stigmatizing label is not a clinical explanation.',
            refs: ['bpd-jama-review', 'dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Symptoms and patterns clinicians look for',
        paragraphs: [
          {
            text: 'Clinicians assess the overall pattern rather than diagnosing from one symptom. Important domains include efforts to avoid abandonment, unstable or intense relationships, identity disturbance, impulsivity, suicidal or self-injurious behavior, affective instability, chronic emptiness, intense anger, and transient stress-related paranoia or dissociation.',
            refs: ['dsm-5-tr', 'bpd-jama-review'],
          },
          {
            text: 'The same diagnosis can look very different across people. One person may present mainly with self-harm and crisis, another with withdrawal and internalized distress, and another with conflict, substance use, or unstable work and relationships. Gender, culture, trauma history, neurodivergence, and the clinical setting can also influence how symptoms are interpreted.',
            refs: ['bpd-jama-review', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'BPD, bipolar disorder, PTSD, ADHD, and autism',
        paragraphs: [
          {
            text: 'BPD can overlap with bipolar disorder, PTSD or complex trauma presentations, ADHD, autism, eating disorders, substance use disorders, depression, and anxiety. Bipolar mood episodes are typically more sustained and episodic, while BPD-related shifts are often closely tied to interpersonal events, perceived rejection, or rapidly changing appraisals. That distinction is useful but not absolute, and both conditions can co-occur.',
            refs: ['bpd-jama-review', 'dsm-5-tr'],
          },
          {
            text: 'A careful diagnosis requires a longitudinal history rather than a snapshot taken during crisis. Clinicians should ask what symptoms were present between episodes, when patterns began, how they appear across relationships and settings, and whether trauma, substances, sleep loss, medication effects, or medical illness better explain the change.',
            refs: ['dsm-5-tr', 'bpd-jama-review'],
          },
        ],
      },
      {
        title: 'Psychotherapy is the foundation of treatment',
        paragraphs: [
          {
            text: 'Guidelines and systematic reviews support structured psychotherapy as the central treatment. Dialectical behavior therapy emphasizes behavioral analysis, distress tolerance, emotion regulation, mindfulness, and interpersonal effectiveness. Mentalization-based treatment focuses on understanding mental states in oneself and others, especially under interpersonal stress.',
            refs: ['nice-bpd', 'bpd-psych-cochrane', 'bpd-meta-analysis'],
          },
          {
            text: 'Schema therapy, transference-focused psychotherapy, and general psychiatric management are additional evidence-informed approaches. No single brand of therapy is best for every person. Treatment quality, a coherent framework, therapist training and supervision, a collaborative safety plan, and sustained engagement may matter as much as the name of the model.',
            refs: ['bpd-psych-cochrane', 'bpd-meta-analysis', 'bpd-jama-review'],
          },
        ],
      },
      {
        title: 'What medication can and cannot do',
        paragraphs: [
          {
            text: 'Medication is not considered the primary treatment for BPD itself. Trials are often small, short, and inconsistent, and systematic reviews do not show a medication that reliably treats the full disorder. Prescribing may still be appropriate for a co-occurring condition such as major depression, bipolar disorder, ADHD, PTSD, psychosis, or a substance-use disorder.',
            refs: ['nice-bpd', 'bpd-pharm-cochrane'],
          },
          {
            text: 'Medication plans should avoid reflexive polypharmacy. Clinicians should define the target, expected benefit, monitoring plan, duration, adverse effects, and stopping strategy. During acute crises, short-term medication may sometimes be used, but it should not replace psychological treatment or a broader crisis plan.',
            refs: ['nice-bpd', 'bpd-pharm-cochrane'],
          },
        ],
      },
      {
        title: 'Self-harm, suicide risk, and crisis planning',
        paragraphs: [
          {
            text: 'Self-harm can serve different functions, including reducing overwhelming arousal, interrupting numbness or dissociation, expressing distress, or punishing the self. Regardless of function, it deserves direct assessment and a plan that addresses triggers, access to means, coping alternatives, supportive contacts, and when to use emergency services.',
            refs: ['nimh-bpd', 'bpd-jama-review'],
          },
          {
            text: 'A calm, validating response does not mean agreeing with every interpretation or removing all boundaries. Effective crisis plans combine empathy, clear expectations, practical coping steps, and rapid escalation when there is imminent danger. In the United States, call or text 988 for crisis support and call 911 for an immediate life-threatening emergency.',
            refs: ['nimh-bpd', 'nice-bpd'],
          },
        ],
      },
      {
        title: 'Recovery and prognosis',
        paragraphs: [
          {
            text: 'BPD can improve substantially. Many people experience reductions in acute symptoms and no longer meet full diagnostic criteria over time. Functional recovery in work, education, relationships, and physical health may take longer and deserves equal attention rather than using symptom counts as the only measure of progress.',
            refs: ['bpd-jama-review'],
          },
          {
            text: 'Recovery is not linear. Sleep, substance use, trauma reminders, invalidating environments, abusive relationships, financial stress, and inconsistent care can destabilize progress. A practical plan often includes therapy, treatment of co-occurring conditions, routines, skills practice, social support, meaningful roles, and attention to physical health.',
            refs: ['bpd-jama-review', 'nice-bpd'],
          },
        ],
      },
      {
        title: 'Supporting someone with BPD',
        paragraphs: [
          {
            text: 'Helpful support usually combines validation with boundaries. Name the emotion without endorsing an inaccurate accusation, be specific about what you can and cannot do, avoid threats or humiliating labels, and discuss crisis plans when everyone is relatively calm. Family members may also benefit from education and their own support.',
            refs: ['nice-bpd', 'bpd-jama-review'],
          },
          {
            text: 'Loved ones are not required to tolerate abuse or become a person’s therapist. Safety, child welfare, and firm limits matter. The goal is a response that is neither punitive nor endlessly accommodating, and that consistently directs serious symptoms toward appropriate professional care.',
            refs: ['nice-bpd'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is BPD the same as bipolar disorder?',
        answer: 'No. They are distinct diagnoses, although they can co-occur and may be confused. A longitudinal assessment of episode duration, triggers, baseline functioning, sleep, energy, and relationship patterns helps clarify the picture.',
        refs: ['dsm-5-tr', 'bpd-jama-review'],
      },
      {
        question: 'Is DBT the only effective treatment?',
        answer: 'No. DBT is well studied, but other structured approaches—including mentalization-based treatment, schema therapy, transference-focused psychotherapy, and good psychiatric management—may also help.',
        refs: ['bpd-psych-cochrane', 'bpd-meta-analysis'],
      },
      {
        question: 'Can BPD go into remission?',
        answer: 'Yes. Many people improve substantially and may no longer meet full diagnostic criteria, although rebuilding stable functioning can take additional time.',
        refs: ['bpd-jama-review'],
      },
      {
        question: 'Are supplements a treatment for BPD?',
        answer: 'No supplement has established evidence as a primary treatment for BPD. Products can interact with psychiatric medications and should not replace structured psychotherapy or crisis care.',
        refs: ['bpd-pharm-cochrane', 'nice-bpd'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, NIMH_BPD, NICE_BPD, BPD_JAMA_REVIEW, BPD_PSYCH_COCHRANE, BPD_PHARM_COCHRANE, BPD_META_ANALYSIS],
  },,
  {
    slug: 'avoidant-borderline-personality-disorders-couples',
    title: 'Avoidant and Borderline Personality Disorders in Couples: What the Research Actually Shows',
    seoTitle: 'Avoidant and Borderline Personality Disorders in Couples',
    description: 'Research review of couples where avoidant and borderline personality traits may interact, including attachment, conflict, withdrawal, reassurance, and treatment.',
    category: 'Personality disorders',
    cluster: 'Overview',
    datePublished: '2026-09-26',
    dateReviewed: '2026-09-26',
    readingTime: '14 min read',
    deck: 'Avoidant personality disorder and borderline personality disorder can both involve intense sensitivity to rejection and abandonment, but they often express that vulnerability differently. Research supports studying the interaction, not reducing couples to a simple “pursuer versus avoider” stereotype.',
    keyPoints: [
      {
        text: 'Direct research on couples specifically recruited because one partner has avoidant personality disorder and the other has borderline personality disorder is sparse. The closest dyadic work measured clinician-rated BPD and AvPD symptom severity across both members of 130 couples rather than testing a single diagnostic pairing.',
        refs: ['bpd-avpd-dyad-beeney'],
      },
      {
        text: 'Avoidant personality disorder is not the same thing as avoidant attachment. AvPD can include strong desire for connection, attachment anxiety, fear of abandonment, shame, and withdrawal used to reduce anticipated rejection.',
        refs: ['avpd-attachment-eikenaes', 'avpd-insights', 'avpd-review'],
      },
      {
        text: 'Borderline personality pathology is strongly associated with romantic attachment anxiety and also significantly associated with attachment avoidance; a meta-analysis found the anxiety association larger on average.',
        refs: ['bpd-attachment-meta-smith', 'bpd-jama-review'],
      },
      {
        text: 'A pursuit-withdrawal cycle is plausible when one partner responds to perceived distance by seeking reassurance or escalating contact while the other responds to threat by retreating. The evidence supports the component processes, but it does not prove that every AvPD+BPD couple follows this sequence.',
        refs: ['bpd-avpd-dyad-beeney', 'bpd-couple-stability-bouchard', 'avpd-attachment-eikenaes'],
      },
      {
        text: 'These relationships are not inevitably unstable. A 2026 qualitative study of six long-term BPD couples highlighted open communication, mutual effort, and secure-base behavior as themes in satisfying relationships, although the very small qualitative sample limits generalization.',
        refs: ['bpd-successful-couples-molyneux'],
      },
    ],
    sections: [
      {
        title: 'First: AvPD is not “avoidant attachment,” and BPD is not an attachment style',
        paragraphs: [
          {
            text: 'Avoidant personality disorder (AvPD) is a clinical diagnosis involving a pervasive pattern of social inhibition, feelings of inadequacy, and hypersensitivity to criticism or rejection. Borderline personality disorder (BPD) is a separate diagnosis involving instability in affect, self-image and relationships, with features that can include intense abandonment sensitivity. Attachment anxiety and attachment avoidance are relationship dimensions, not diagnoses.',
            refs: ['dsm-5-tr', 'avpd-review', 'bpd-jama-review'],
          },
          {
            text: 'The distinction matters because the everyday phrase “avoidant partner” often refers to attachment avoidance, emotional withdrawal, or simply wanting space. A person with AvPD may withdraw while simultaneously wanting closeness and fearing abandonment. In a multisite study, patients with AvPD showed especially elevated attachment anxiety around abandonment and separation compared with patients who had social phobia without AvPD.',
            refs: ['avpd-attachment-eikenaes'],
          },
        ],
      },
      {
        title: 'What AvPD may bring into a close relationship',
        paragraphs: [
          {
            text: 'AvPD often involves an approach-avoidance conflict: closeness is wanted, but exposing needs or imperfections can feel dangerous because rejection, humiliation, or disapproval is anticipated. Withdrawal can therefore function as short-term threat reduction rather than indifference.',
            refs: ['avpd-review', 'avpd-insights', 'avpd-attachment-eikenaes'],
          },
          {
            text: 'Interpersonal research also shows that AvPD is not one uniform style. In an outpatient study examining both AvPD and BPD symptoms, AvPD-related social dysfunction was indirectly associated with cold interpersonal problems and with overly nurturant patterns. Other work has described nonassertive, friendly-submissive, and cold-submissive presentations. A partner with AvPD should therefore not be assumed to be emotionally detached or uniformly passive.',
            refs: ['bpd-avpd-interpersonal-mccloskey', 'avpd-insights'],
          },
        ],
      },
      {
        title: 'What BPD may bring into a close relationship',
        paragraphs: [
          {
            text: 'BPD is strongly linked with interpersonal sensitivity, especially in attachment-relevant situations. A meta-analysis of romantic attachment studies found a larger association between BPD traits and attachment anxiety than between BPD traits and attachment avoidance, while both dimensions were significantly related to BPD pathology.',
            refs: ['bpd-attachment-meta-smith'],
          },
          {
            text: 'Reviews of romantic relationships in BPD describe, on average, greater relationship instability, insecurity and dissatisfaction than comparison groups. These are group-level findings, not predictions about a particular person. They also do not mean that intense emotion, conflict, or a breakup automatically demonstrates BPD.',
            refs: ['bpd-romantic-review-navarro', 'bpd-jama-review'],
          },
        ],
      },
      {
        title: 'The most relevant dyadic study measured both BPD and AvPD',
        paragraphs: [
          {
            text: 'A particularly relevant study observed 130 couples during a ten-minute conflict discussion and assessed clinician-rated BPD and AvPD criteria in both partners. Higher BPD symptoms were associated with lower relationship satisfaction for the person and the partner. People with more BPD symptoms showed more criticism, while their partners showed more defensiveness and stonewalling. Conflict behavior partly accounted for relationship-satisfaction differences.',
            refs: ['bpd-avpd-dyad-beeney'],
          },
          {
            text: 'The same study found that higher AvPD symptom severity predicted worsening relationship satisfaction across the following year. Importantly, the investigators included AvPD partly to test whether partner withdrawal seen around BPD could simply be explained by having an avoidant-personality partner. Their findings did not justify that simple explanation.',
            refs: ['bpd-avpd-dyad-beeney'],
          },
          {
            text: 'This study is unusually useful for the AvPD+BPD question, but it still did not recruit a group defined as “one diagnosed AvPD partner plus one diagnosed BPD partner.” It supports examining both symptom dimensions inside the couple; it does not establish a special diagnostic compatibility or incompatibility.',
            refs: ['bpd-avpd-dyad-beeney'],
          },
        ],
      },
      {
        title: 'The possible pursuit-withdrawal loop',
        paragraphs: [
          {
            text: 'A clinically plausible cycle emerges when the evidence is considered together. One partner may notice distance and experience it as possible abandonment, increasing reassurance seeking, protest, criticism, repeated contact, or urgency. The other partner may experience that intensity as evidence that rejection, shame, criticism, or conflict is imminent and retreat further. The increased distance can then confirm the first partner’s fear and intensify the next approach.',
            refs: ['bpd-attachment-meta-smith', 'avpd-attachment-eikenaes', 'bpd-avpd-dyad-beeney'],
          },
          {
            text: 'This should be understood as a hypothesis about interacting regulation strategies, not a formula. BPD can also involve withdrawal, detachment or avoidance, and AvPD can involve reassurance needs and fear of abandonment. Both disorders can contain mixtures of approach and avoidance depending on context, severity, history and the specific relationship.',
            refs: ['bpd-attachment-meta-smith', 'avpd-attachment-eikenaes', 'avpd-insights'],
          },
        ],
      },
      {
        title: 'Breakups, reconciliations, and demand-withdraw communication',
        paragraphs: [
          {
            text: 'In a study of 35 couples that included a woman diagnosed with BPD, frequent breakup-reconciliation episodes were common, nearly 30% of the couples separated during an 18-month follow-up, and the BPD couples reported more attachment insecurity and demand-withdraw communication than 35 nonclinical comparison couples. Nearly half of the male partners met criteria for at least one personality disorder.',
            refs: ['bpd-couple-stability-bouchard'],
          },
          {
            text: 'Those findings are often cited because they resemble popular descriptions of BPD relationships, but the sample was small, gender-specific and clinically selected. They cannot be converted into a breakup probability for an individual couple, and they do not tell us that the partners’ personality disorders caused every conflict.',
            refs: ['bpd-couple-stability-bouchard', 'bpd-romantic-review-navarro'],
          },
        ],
      },
      {
        title: 'Why “give them space” can help in one moment and hurt in another',
        paragraphs: [
          {
            text: 'Withdrawal can reduce arousal and prevent impulsive escalation, so a time-limited pause can be useful. The problem is ambiguity. Unexplained silence may be interpreted as rejection or abandonment, while forced closeness can feel intrusive or shaming to a partner who is overwhelmed. A structured pause communicates both boundaries and continuity: the conversation stops temporarily, but the relationship has not silently disappeared.',
            refs: ['bpd-avpd-dyad-beeney', 'bpd-successful-couples-molyneux'],
          },
          {
            text: 'The 2026 qualitative study of six long-term couples involving BPD found that secure-base behavior and open communication were central themes in how participants described satisfying relationships. Some partners with more avoidant attachment tendencies described giving space rather than moving toward distress. Because the study was qualitative and tiny, this is useful for hypothesis generation rather than a treatment rule.',
            refs: ['bpd-successful-couples-molyneux'],
          },
        ],
      },
      {
        title: 'The partner cannot become the therapist',
        paragraphs: [
          {
            text: 'A systematic review of partners of people with BPD identified emotional strain, feelings of limited control, and a tendency for partners to slide into parental or therapeutic roles. That role confusion can undermine reciprocity and can exhaust the partner who feels responsible for preventing every crisis.',
            refs: ['bpd-partner-review-greer'],
          },
          {
            text: 'Support can include listening, validation, predictable communication and agreed crisis plans, but it should not require one partner to diagnose, monitor or regulate the other person continuously. Each partner remains responsible for seeking appropriate treatment and for behavior that affects the other person.',
            refs: ['bpd-partner-review-greer', 'bpd-significant-others-fitzpatrick'],
          },
        ],
      },
      {
        title: 'What treatment research implies for the couple',
        paragraphs: [
          {
            text: 'The strongest evidence base is still disorder-focused treatment rather than an AvPD+BPD-specific couples protocol. BPD has several structured psychotherapies with evidence of benefit, while AvPD treatment evidence is smaller and commonly targets social inhibition, shame, negative self-beliefs, attachment fears and avoidance.',
            refs: ['bpd-jama-review', 'avpd-review', 'avpd-insights'],
          },
          {
            text: 'A review of BPD interventions involving significant others found support for approaches that address the close-relationship context rather than treating the partner as irrelevant. Psychoeducation, skills, validation, clearer communication and relationship-focused work may reduce distress, but the literature remains much thinner than the individual-treatment literature.',
            refs: ['bpd-significant-others-fitzpatrick', 'bpd-partner-review-greer'],
          },
          {
            text: 'For a couple caught in a pursuit-withdrawal pattern, a useful treatment formulation may target both sides of the loop: tolerating separation without catastrophic interpretation, communicating the need for space without disappearing, asking directly for reassurance instead of testing the relationship, reducing criticism and defensiveness, and returning to difficult conversations after arousal falls.',
            refs: ['bpd-avpd-dyad-beeney', 'bpd-successful-couples-molyneux', 'bpd-significant-others-fitzpatrick'],
          },
        ],
      },
      {
        title: 'Diagnosis never excuses abuse or removes agency',
        paragraphs: [
          {
            text: 'Neither BPD nor AvPD makes abuse inevitable, and neither diagnosis should be used to excuse threats, coercion, stalking, violence, intimidation, financial control, or deliberate punishment. Conversely, a partner should not label ordinary conflict, needing space, reassurance seeking, or emotional intensity as abuse simply because a personality-disorder diagnosis is present.',
            refs: ['dsm-5-tr', 'bpd-jama-review', 'avpd-review'],
          },
          {
            text: 'When there is actual violence, credible threat, coercive control, stalking, or danger to children, safety planning takes priority over analyzing attachment dynamics. Relationship work is appropriate only when it can occur without pressuring someone to remain in an unsafe situation.',
            refs: ['bpd-partner-review-greer', 'bpd-jama-review'],
          },
        ],
      },
      {
        title: 'The research bottom line',
        paragraphs: [
          {
            text: 'The literature supports a nuanced picture: AvPD and BPD can both involve rejection sensitivity, attachment insecurity and fear of abandonment, but the observable coping strategy may differ. Withdrawal and urgent approach can interact in ways that amplify each person’s threat response. That interaction is clinically plausible and partly supported by dyadic evidence, but there is not enough direct research to declare an AvPD+BPD “relationship type.”',
            refs: ['avpd-attachment-eikenaes', 'bpd-attachment-meta-smith', 'bpd-avpd-dyad-beeney'],
          },
          {
            text: 'The most defensible conclusion is therefore neither “these disorders are naturally incompatible” nor “they are uniquely attracted to each other.” Relationship quality depends on severity, insight, treatment, communication, trauma history, substance use, external stress, partner behavior, safety, and the couple’s ability to repair ruptures. Diagnoses describe vulnerabilities; they do not write the ending.',
            refs: ['bpd-romantic-review-navarro', 'bpd-successful-couples-molyneux', 'bpd-significant-others-fitzpatrick'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is avoidant personality disorder the same as avoidant attachment?',
        answer: 'No. AvPD is a clinical personality-disorder diagnosis. Avoidant attachment is a relationship dimension. A person with AvPD can show attachment anxiety, attachment avoidance, or both, and fear of abandonment has been documented in AvPD research.',
        refs: ['avpd-attachment-eikenaes', 'avpd-review'],
      },
      {
        question: 'Do BPD and AvPD naturally create a pursuer-withdrawer relationship?',
        answer: 'They can contribute to that pattern, but it is not inevitable. Research supports rejection sensitivity, attachment insecurity, criticism, defensiveness and withdrawal as relevant processes; it does not establish one universal AvPD+BPD couple script.',
        refs: ['bpd-avpd-dyad-beeney', 'bpd-attachment-meta-smith', 'avpd-attachment-eikenaes'],
      },
      {
        question: 'Are couples with BPD and AvPD doomed to break up?',
        answer: 'No. Group studies identify elevated average relationship difficulties, but they cannot predict an individual couple. Long-term satisfying relationships involving BPD have been documented, and treatment, communication and secure-base behavior may matter.',
        refs: ['bpd-romantic-review-navarro', 'bpd-successful-couples-molyneux'],
      },
      {
        question: 'Should the more avoidant partner always be given space?',
        answer: 'Not automatically. A time-limited pause can lower arousal, but unexplained disappearance may intensify abandonment fears. Research supports clearer, predictable communication rather than treating withdrawal or pursuit as the only valid strategy.',
        refs: ['bpd-avpd-dyad-beeney', 'bpd-successful-couples-molyneux'],
      },
      {
        question: 'Can couples therapy replace individual treatment?',
        answer: 'Usually not. Couples or significant-other work may help relationship processes, while each disorder still requires an individualized clinical formulation and, when indicated, disorder-focused psychotherapy.',
        refs: ['bpd-significant-others-fitzpatrick', 'avpd-review', 'bpd-jama-review'],
      },
    ],
    references: [
      DSM_5_TR,
      BPD_JAMA_REVIEW,
      AVPD_REVIEW,
      AVPD_INSIGHTS,
      AVPD_ATTACHMENT_EIKENAES,
      BPD_ATTACHMENT_META_SMITH,
      BPD_AVPD_DYAD_BEENEY,
      BPD_AVPD_INTERPERSONAL_MCCLOSKEY,
      BPD_COUPLE_STABILITY_BOUCHARD,
      BPD_ROMANTIC_REVIEW_NAVARRO,
      BPD_PARTNER_REVIEW_GREER,
      BPD_SIGNIFICANT_OTHERS_FITZPATRICK,
      BPD_SUCCESSFUL_COUPLES_MOLYNEUX,
    ],
  }
]
