import type { MentalHealthArticle } from './types'
import {
  AMPD_REVIEW,
  ASPD_PHARM_COCHRANE,
  ASPD_PSYCH_COCHRANE,
  DSM_5_TR,
  NICE_ASPD,
  NPD_REVIEW,
  PERSONALITY_TREATMENT_LANCET,
  WHO_ICD11_CDDR,
} from './references'

const REVIEW_DATE = '2026-07-13'

export const clusterBMentalHealthArticles: MentalHealthArticle[] = [
  {
    slug: 'antisocial-personality-disorder',
    title: 'Antisocial Personality Disorder: Diagnosis, Risk, Treatment, and Common Myths',
    seoTitle: 'Antisocial Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to antisocial personality disorder, including diagnosis, conduct-disorder history, risk assessment, treatment evidence, medication limits, and stigma.',
    category: 'Personality disorders',
    cluster: 'Cluster B',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '13 min read',
    deck: 'Antisocial personality disorder is a clinical diagnosis involving a persistent pattern of violating others’ rights and social norms. It is not synonymous with criminality, violence, psychopathy, or the casual label sociopath.',
    keyPoints: [
      {
        text: 'DSM-5-TR diagnosis requires an adult pattern of antisocial behavior plus evidence of conduct disorder beginning before age 15; adult misconduct alone is not sufficient.',
        refs: ['dsm-5-tr'],
      },
      {
        text: 'Risk varies widely. A diagnosis does not prove that someone is violent, and violence risk assessment must consider current behavior, substance use, threats, access to weapons, history, environment, and protective factors.',
        refs: ['nice-aspd', 'dsm-5-tr'],
      },
      {
        text: 'Treatment evidence is limited. Structured cognitive and behavioral interventions may target offending, aggression, impulsivity, substance use, and practical functioning, but effects are generally modest and engagement can be difficult.',
        refs: ['nice-aspd', 'aspd-psych-cochrane'],
      },
      {
        text: 'No medication is established for antisocial personality disorder itself. Medication may be appropriate for co-occurring disorders or specific symptoms with a clear rationale.',
        refs: ['aspd-pharm-cochrane', 'nice-aspd'],
      },
    ],
    sections: [
      {
        title: 'What antisocial personality disorder means clinically',
        paragraphs: [
          {
            text: 'Antisocial personality disorder involves a pervasive pattern of disregard for and violation of other people’s rights. Features may include repeated unlawful behavior, deceitfulness, impulsivity, aggression, reckless disregard for safety, persistent irresponsibility, and limited remorse. Diagnosis requires more than one act, one criminal charge, or conflict with authority.',
            refs: ['dsm-5-tr', 'nice-aspd'],
          },
          {
            text: 'The word antisocial is often misunderstood. In everyday speech it may mean shy or withdrawn, but the clinical term refers to behavior that is harmful, exploitative, irresponsible, or violating. Social isolation by itself is not antisocial personality disorder.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
      {
        title: 'The conduct-disorder requirement and developmental history',
        paragraphs: [
          {
            text: 'In DSM-5-TR, antisocial personality disorder is diagnosed only in adults and requires evidence of conduct disorder with onset before age 15. Conduct-disorder symptoms can include serious aggression, destruction of property, deceit or theft, and major rule violations. A clinician should not infer this history from adult behavior without evidence.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'Developmental assessment considers family and community violence, maltreatment, school exclusion, neurodevelopmental disorders, substance exposure, peer context, poverty, and access to effective early intervention. These factors can shape risk without excusing harm or making the outcome inevitable.',
            refs: ['nice-aspd', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'ASPD, psychopathy, and sociopathy are not interchangeable',
        paragraphs: [
          {
            text: 'Psychopathy is a research and forensic construct that usually includes interpersonal and affective traits in addition to antisocial behavior. It is not identical to the DSM diagnosis. Sociopathy has no single current diagnostic definition and is used inconsistently in popular media, legal discussion, and older literature.',
            refs: ['dsm-5-tr', 'nice-aspd'],
          },
          {
            text: 'Using these terms as armchair labels can create false certainty. A person can behave cruelly without meeting criteria for a personality disorder, and a person with antisocial personality disorder does not automatically possess every trait associated with psychopathy.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Violence and risk assessment',
        paragraphs: [
          {
            text: 'The diagnosis is associated with elevated average risk for offending and aggression, but it is not a prediction that a specific person will be violent. Individual risk assessment weighs recent threats, intent, planning, access to means, past violence, substance use, acute psychosis or mania, relationship conflict, legal stress, treatment engagement, and protective factors.',
            refs: ['nice-aspd'],
          },
          {
            text: 'Immediate action is warranted when there is a credible threat, a plan, escalating stalking or coercion, access to weapons, severe intoxication, or imminent danger. Safety planning should prioritize potential victims and children rather than relying on diagnosis alone.',
            refs: ['nice-aspd'],
          },
        ],
      },
      {
        title: 'Psychological and behavioral treatment',
        paragraphs: [
          {
            text: 'NICE recommends structured cognitive and behavioral interventions in selected settings, particularly when they target offending behavior, impulsivity, anger, interpersonal problem-solving, and relapse prevention. Substance-use treatment, vocational support, housing, and legal coordination may be essential parts of the plan.',
            refs: ['nice-aspd'],
          },
          {
            text: 'Cochrane reviews describe the evidence as limited and often low certainty. Programs should use measurable outcomes, avoid assuming that one intervention fits everyone, monitor manipulation or coercion without becoming punitive, and address dropout and practical barriers directly.',
            refs: ['aspd-psych-cochrane'],
          },
        ],
      },
      {
        title: 'Medication: limited role and clear targets',
        paragraphs: [
          {
            text: 'No medication has established efficacy for antisocial personality disorder as a whole. Pharmacological studies are few and do not justify routine prescribing solely for the diagnosis. Medication may still be indicated for ADHD, depression, bipolar disorder, psychosis, anxiety, opioid or alcohol use disorder, or another independently diagnosed condition.',
            refs: ['aspd-pharm-cochrane', 'nice-aspd'],
          },
          {
            text: 'When medication is used to target aggression, impulsivity, or mood symptoms, the prescriber should specify the target, monitor benefit and harm, consider overdose and diversion risk, and discontinue treatment that does not produce meaningful improvement.',
            refs: ['nice-aspd', 'aspd-pharm-cochrane'],
          },
        ],
      },
      {
        title: 'Accountability without dehumanization',
        paragraphs: [
          {
            text: 'A diagnosis should never be used to excuse abuse, exploitation, or violence. It also should not be used to claim that a person is irredeemably evil, has no emotions, or cannot make choices. Effective management can hold firm boundaries while preserving dignity and access to care.',
            refs: ['who-icd11-cddr', 'nice-aspd'],
          },
          {
            text: 'Family members and partners should not attempt to treat dangerous behavior on their own. Documentation, legal advice, domestic-violence resources, child-safety planning, and emergency services may be more appropriate than confrontation when there is coercion or credible danger.',
            refs: ['nice-aspd'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is everyone with antisocial personality disorder violent?',
        answer: 'No. Average risk may be elevated, but an individual’s risk must be assessed from current and historical factors rather than the diagnosis alone.',
        refs: ['nice-aspd'],
      },
      {
        question: 'Is ASPD the same as psychopathy?',
        answer: 'No. They overlap but are not identical constructs. Psychopathy is not the formal DSM diagnosis of antisocial personality disorder.',
        refs: ['dsm-5-tr'],
      },
      {
        question: 'Can ASPD be treated?',
        answer: 'Some targeted interventions may reduce specific harmful behaviors and improve functioning, but evidence is limited and treatment engagement is often challenging.',
        refs: ['aspd-psych-cochrane', 'nice-aspd'],
      },
      {
        question: 'Is there a medication for ASPD?',
        answer: 'No medication is established for the disorder itself. Medication may treat a separate condition or a specific target symptom.',
        refs: ['aspd-pharm-cochrane'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, NICE_ASPD, ASPD_PSYCH_COCHRANE, ASPD_PHARM_COCHRANE, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'histrionic-personality-disorder',
    title: 'Histrionic Personality Disorder: Symptoms, Diagnosis, Bias, and Treatment',
    seoTitle: 'Histrionic Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to histrionic personality disorder, including attention-seeking patterns, emotional expression, diagnostic bias, differential diagnosis, and limited treatment evidence.',
    category: 'Personality disorders',
    cluster: 'Cluster B',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '10 min read',
    deck: 'Histrionic personality disorder describes a persistent pattern of excessive emotionality and attention-seeking that causes impairment. It should not be used as a dismissive label for expressive, dramatic, feminine, or sexually confident behavior.',
    keyPoints: [
      {
        text: 'Diagnosis requires a pervasive, enduring pattern with functional consequences—not isolated dramatic behavior or a clinician’s dislike of someone’s style.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        text: 'Assessment should actively consider cultural norms, gender stereotypes, trauma, mood episodes, substance use, ADHD, and overlap with borderline or narcissistic personality pathology.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        text: 'There is little disorder-specific trial evidence. Psychotherapy is individualized and may target emotional awareness, interpersonal patterns, self-worth, impulsivity, and co-occurring conditions.',
        refs: ['personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What the diagnosis describes',
        paragraphs: [
          {
            text: 'Histrionic personality disorder is characterized by a long-standing pattern of excessive emotionality and efforts to attract or retain attention. Features can include discomfort when not the focus, rapidly shifting or shallow-seeming emotional expression, impressionistic speech, suggestibility, theatrical expression, and perceiving relationships as more intimate than they are.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'Expressiveness is not pathology by itself. A diagnosis requires inflexibility, persistence across settings, and clinically important impairment or distress. Cultural communication styles, performance roles, social-media behavior, fashion, and consensual sexuality should not be pathologized merely because they are visible or unconventional.',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Bias and the risk of a careless diagnosis',
        paragraphs: [
          {
            text: 'Historically, the concept has been entangled with gendered stereotypes. Clinicians should avoid translating ordinary emotional expression, flirtation, appearance, or conflict into diagnosis without evidence of a pervasive dysfunctional pattern. The same behavior may be judged differently depending on the person’s gender, culture, race, or social role.',
            refs: ['who-icd11-cddr', 'dsm-5-tr'],
          },
          {
            text: 'A careful assessment asks what function the behavior serves, whether the person can adapt when circumstances change, how relationships actually unfold, and whether attention-seeking is better explained by insecurity, trauma, mania, substance use, ADHD, developmental factors, or another personality pattern.',
            refs: ['dsm-5-tr', 'ampd-review'],
          },
        ],
      },
      {
        title: 'Differential diagnosis and overlap',
        paragraphs: [
          {
            text: 'Borderline personality disorder may involve intense abandonment fears, identity disturbance, self-harm, chronic emptiness, and marked affective instability. Narcissistic personality disorder centers more on self-esteem regulation, grandiosity, entitlement, admiration, and empathy difficulties. Histrionic features can overlap with both without being identical.',
            refs: ['dsm-5-tr'],
          },
          {
            text: 'Bipolar mania or hypomania can produce increased sociability, sexuality, confidence, emotional intensity, and attention-seeking, but these occur as episodes with changes in sleep, energy, activity, and judgment. Substance effects and some neurological conditions can also produce abrupt personality changes.',
            refs: ['dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Treatment goals',
        paragraphs: [
          {
            text: 'There is no well-established, disorder-specific psychotherapy supported by a large trial literature. Treatment is generally adapted from broader personality-disorder approaches and may focus on recognizing emotional states, tolerating ordinary levels of attention, building stable self-worth, examining relationship expectations, and reducing impulsive or self-defeating behavior.',
            refs: ['personality-treatment-lancet'],
          },
          {
            text: 'A clear treatment frame can help when sessions become crisis-driven or focused on winning approval. The clinician should validate genuine emotion without rewarding exaggeration, remain warm without becoming seductive or rejecting, and collaborate on observable goals outside the therapy relationship.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Medication and co-occurring disorders',
        paragraphs: [
          {
            text: 'No medication is established for histrionic personality disorder itself. Medication may be appropriate for a co-occurring depressive, anxiety, bipolar, ADHD, trauma-related, sleep, or substance-use disorder after a separate assessment.',
            refs: ['personality-treatment-lancet'],
          },
          {
            text: 'Using sedatives or repeated medication changes to manage every interpersonal crisis can create dependence, adverse effects, and diagnostic confusion. Prescribing should use specific targets, conservative monitoring, and regular review.',
            refs: ['personality-treatment-lancet'],
          },
        ],
      },
      {
        title: 'Relationships and boundaries',
        paragraphs: [
          {
            text: 'Loved ones can respond to the underlying emotion while maintaining consistent boundaries. It is usually more useful to say what behavior is workable than to accuse someone of being dramatic or attention-seeking. Public humiliation and strategic withdrawal may intensify the cycle.',
            refs: ['personality-treatment-lancet'],
          },
          {
            text: 'A personality-disorder label never requires someone to remain in an unsafe or abusive relationship. Boundaries, separation, child-safety decisions, and domestic-violence support should be based on behavior and risk rather than diagnostic speculation.',
            refs: ['who-icd11-cddr'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is being dramatic enough for a diagnosis?',
        answer: 'No. Diagnosis requires a pervasive, persistent pattern with significant impairment or distress, assessed in cultural and developmental context.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        question: 'Is HPD diagnosed only in women?',
        answer: 'No. Any gender can meet criteria. Clinicians should actively guard against gendered interpretation and referral bias.',
        refs: ['dsm-5-tr', 'who-icd11-cddr'],
      },
      {
        question: 'What treatment has the best evidence?',
        answer: 'The disorder-specific evidence base is thin. Treatment is usually individualized psychotherapy targeting the person’s patterns, goals, risks, and co-occurring conditions.',
        refs: ['personality-treatment-lancet'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, AMPD_REVIEW, PERSONALITY_TREATMENT_LANCET],
  },
  {
    slug: 'narcissistic-personality-disorder',
    title: 'Narcissistic Personality Disorder: Traits, Diagnosis, Relationships, and Treatment',
    seoTitle: 'Narcissistic Personality Disorder: Symptoms and Treatment',
    description: 'Evidence-based guide to narcissistic personality disorder, including grandiosity, vulnerability, empathy, diagnosis, internet myths, relationships, and treatment.',
    category: 'Personality disorders',
    cluster: 'Cluster B',
    datePublished: REVIEW_DATE,
    dateReviewed: REVIEW_DATE,
    readingTime: '13 min read',
    deck: 'Narcissistic personality disorder is a clinical pattern involving impaired self-esteem regulation, grandiosity or vulnerability, need for admiration, entitlement, and interpersonal dysfunction. It is not a synonym for selfish, abusive, or unpleasant.',
    keyPoints: [
      {
        text: 'Narcissistic traits exist on a continuum. A disorder requires a pervasive pattern with impaired self and interpersonal functioning, not a few arrogant or inconsiderate acts.',
        refs: ['dsm-5-tr', 'npd-review', 'ampd-review'],
      },
      {
        text: 'Grandiose and vulnerable presentations are clinically useful descriptions but are not separate official DSM diagnoses. The same person may shift between self-inflation and shame or collapse.',
        refs: ['npd-review'],
      },
      {
        text: 'Abuse is defined by behavior, not diagnosis. Many abusive people do not have NPD, and an NPD diagnosis cannot be made reliably from a partner’s stories or social-media content.',
        refs: ['dsm-5-tr', 'npd-review'],
      },
      {
        text: 'Psychotherapy is the main treatment; there is no medication established for NPD itself. The evidence base is smaller than it is for BPD.',
        refs: ['npd-review', 'personality-treatment-lancet'],
      },
    ],
    sections: [
      {
        title: 'What narcissistic personality disorder is',
        paragraphs: [
          {
            text: 'Narcissistic personality disorder involves a persistent pattern of grandiosity, need for admiration, entitlement, and impaired empathy, together with significant problems in self and interpersonal functioning. The outward style may be openly self-important, but it may also be fragile, defensive, ashamed, or highly reactive to criticism.',
            refs: ['dsm-5-tr', 'npd-review'],
          },
          {
            text: 'Healthy self-confidence, ambition, pride, self-promotion, or occasional selfishness do not establish a disorder. Clinical assessment asks whether the pattern is rigid, pervasive, developmentally persistent, and damaging across relationships, work, judgment, or emotional stability.',
            refs: ['dsm-5-tr', 'ampd-review'],
          },
        ],
      },
      {
        title: 'Grandiose and vulnerable presentations',
        paragraphs: [
          {
            text: 'Grandiose presentations may feature dominance, exhibitionism, entitlement, competitiveness, dismissiveness, and visible superiority. Vulnerable presentations may feature shame, hypersensitivity, resentment, withdrawal, envy, and oscillation between feeling special and feeling worthless. These patterns can coexist or alternate.',
            refs: ['npd-review'],
          },
          {
            text: 'The terms covert narcissist and vulnerable narcissist are widely used online, but they are not separate DSM diagnoses. They can be useful only when they clarify a pattern rather than becoming labels applied to any quiet, insecure, passive-aggressive, or conflict-avoidant person.',
            refs: ['npd-review', 'dsm-5-tr'],
          },
        ],
      },
      {
        title: 'Empathy is more complicated than on or off',
        paragraphs: [
          {
            text: 'NPD can involve difficulty recognizing, tolerating, or prioritizing other people’s feelings, especially when self-esteem is threatened. Some people can understand another person’s perspective cognitively while struggling to respond with emotional concern or while overriding concern in pursuit of status, control, or self-protection.',
            refs: ['npd-review', 'ampd-review'],
          },
          {
            text: 'Saying that everyone with NPD has zero empathy is inaccurate. Empathic capacity can vary by context, relationship, stress, motivation, and treatment. The clinically relevant issue is the repeated interpersonal impact, not a simplistic claim that an entire human capacity is absent.',
            refs: ['npd-review'],
          },
        ],
      },
      {
        title: 'Diagnosis and differential diagnosis',
        paragraphs: [
          {
            text: 'A clinician assesses long-term self-esteem regulation, identity, goals, empathy, intimacy, entitlement, admiration seeking, exploitation, envy, shame, anger, and reactions to criticism. Information from multiple contexts may be important because self-report can understate or overstate different parts of the pattern.',
            refs: ['dsm-5-tr', 'ampd-review', 'npd-review'],
          },
          {
            text: 'Differential diagnosis includes bipolar mania, substance effects, antisocial personality disorder, borderline personality disorder, histrionic personality disorder, depression, trauma-related defenses, autism, and culturally reinforced status behavior. A sudden period of grandiosity with decreased need for sleep and increased activity points toward an episodic mood process rather than a stable personality pattern.',
            refs: ['dsm-5-tr', 'npd-review'],
          },
        ],
      },
      {
        title: 'NPD, abuse, and internet diagnosis',
        paragraphs: [
          {
            text: 'Narcissistic abuse is a popular phrase, but abuse should be identified through concrete behaviors such as coercive control, threats, isolation, financial exploitation, stalking, sexual coercion, intimidation, or violence. A partner does not need a psychiatric diagnosis for the abuse to be real or for safety planning to be justified.',
            refs: ['npd-review', 'dsm-5-tr'],
          },
          {
            text: 'Diagnosing an absent person from clips, texts, or one side of a relationship is unreliable. It may also distract from the practical question: what behavior occurred, what risk exists now, what boundaries are needed, and what support is available?',
            refs: ['dsm-5-tr', 'who-icd11-cddr'],
          },
        ],
      },
      {
        title: 'Psychotherapy and treatment challenges',
        paragraphs: [
          {
            text: 'Psychotherapy may target unstable self-esteem, shame, entitlement, perfectionism, empathy, anger, relationship patterns, and the ability to tolerate ordinary limits or disappointment. Psychodynamic, mentalization-based, schema-focused, transference-focused, and cognitive approaches are used, but high-quality disorder-specific trials remain limited.',
            refs: ['npd-review', 'personality-treatment-lancet'],
          },
          {
            text: 'Treatment can become difficult when feedback feels humiliating or when the person expects special rules. A useful therapeutic stance combines respect with honesty, avoids both admiration and contempt, and links interpretations to the person’s own goals and real-world consequences.',
            refs: ['npd-review'],
          },
        ],
      },
      {
        title: 'Medication, prognosis, and change',
        paragraphs: [
          {
            text: 'No medication is established for narcissistic personality disorder itself. Medication may treat co-occurring depression, anxiety, ADHD, bipolar disorder, substance use, sleep disturbance, or another diagnosed condition. Prescribing should not substitute for work on the personality pattern.',
            refs: ['npd-review', 'personality-treatment-lancet'],
          },
          {
            text: 'Change is possible, but motivation may increase only after a loss, depression, relationship breakdown, occupational failure, or other injury to self-esteem. Progress may include better emotional regulation, greater responsibility, more realistic self-appraisal, improved empathy, and less exploitative or defensive behavior.',
            refs: ['npd-review'],
          },
        ],
      },
    ],
    faq: [
      {
        question: 'Is every selfish or abusive person a narcissist?',
        answer: 'No. Selfishness and abuse are behaviors, not diagnoses. NPD requires a persistent clinical pattern assessed by a qualified professional.',
        refs: ['dsm-5-tr', 'npd-review'],
      },
      {
        question: 'Do people with NPD have no empathy?',
        answer: 'Empathic functioning is often impaired, but it is not accurately described as universally or permanently absent in every person and every context.',
        refs: ['npd-review'],
      },
      {
        question: 'Can NPD be treated?',
        answer: 'Psychotherapy may help, although the disorder-specific research base is limited and engagement can be challenging. Treatment often focuses on self-esteem regulation and interpersonal functioning.',
        refs: ['npd-review', 'personality-treatment-lancet'],
      },
      {
        question: 'Is covert narcissism an official diagnosis?',
        answer: 'No. Vulnerable or covert narcissism describes a presentation discussed in clinical literature, but it is not a separate DSM diagnosis.',
        refs: ['npd-review', 'dsm-5-tr'],
      },
    ],
    references: [DSM_5_TR, WHO_ICD11_CDDR, AMPD_REVIEW, NPD_REVIEW, PERSONALITY_TREATMENT_LANCET],
  },
]
