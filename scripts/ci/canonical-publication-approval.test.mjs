import { describe, it, expect } from 'vitest'
import { evaluateReadiness } from './autonomous-merge-controller.mjs'
import { assessPublicationApproval, classifyPublicationChange, verifyOwnerSignedTag, ownerSignedTagName, loadPublicationApprovalEvidence } from './canonical-publication-approval.mjs'

const sha='a'.repeat(40)
const older='b'.repeat(40)
const pr={number:6703,base:{repo:{owner:{login:'Razzleberrytt'},full_name:'Razzleberrytt/hippie-scientist-site'}},head:{sha,repo:{full_name:'Razzleberrytt/hippie-scientist-site'}}}
const publicFile='content/articles/new-licorice-claim.md'
const approval=(head=sha,login='Razzleberrytt',id=1)=>({
  id, user:{login,type:'User'},performed_via_github_app:null,
  body:`THS-PUBLICATION-APPROVED PR=#6703 HEAD=${head}`,created_at:'2026-10-12T16:00:00Z',
  updated_at:'2026-10-12T16:00:00Z'
})
const decide=(changedFiles,extra={})=>assessPublicationApproval({pr,changedFiles,...extra})

describe('canonical publication approval',()=>{
  it('auto-clears only inert staging, without clinical publication rights',()=>{
    expect(classifyPublicationChange(['docs/research/deep-enrichment-13.md','ops/editorial-runtime/publication-pilots/x.md']).kind).toBe('AUTO_STAGING')
    const r=decide(['ops/editorial-runtime/publication-pilots/d-mannose.md'])
    expect(r.allowed).toBe(true)
    expect(r.kind).toBe('AUTO_STAGING')
  })
  it('retains original controller governance for unrelated code, never calls it publication approval',()=>{
    const r=decide(['scripts/ui/palette.mjs'])
    expect(r).toMatchObject({allowed:true,kind:'EXISTING_GATES'})
  })
  it('holds on empty, malformed, or unknown changed-files input',()=>{
    for(const files of [[],null,['']]){
      expect(classifyPublicationChange(files).kind).toBe('HOLD')
      expect(decide(files).allowed).toBe(false)
    }
  })
  it('requires human approval for clinical articles, public herb data and app guidance, including mixed diffs',()=>{
    for(const file of [publicFile,'public/data/herbs-detail/licorice.json','public/data/claims.json','app/guides/sleep/page.tsx','data-sources/herb_monograph_master.xlsx']){
      const r=decide([file])
      expect(r.kind).toBe('HUMAN_PUBLICATION')
      expect(r.allowed).toBe(false)
    }
    expect(decide(['docs/research/safe.md',publicFile]).allowed).toBe(false)
  })
  it('requires exact head, owner and exact PR number (general approval is invalid)',()=>{
    for(const c of [
      approval(older),
      approval(sha,'someoneelse'),
      {...approval(),body:'Approve all'},
      {...approval(),body:`THS-PUBLICATION-APPROVED PR=#999 HEAD=${sha}`},
      {...approval(),user:{login:'Razzleberrytt',type:'Bot'}}
    ]){
      expect(decide([publicFile],{comments:[c]}).allowed).toBe(false)
    }
  })
  it('holds even unedited owner comments until an immutable creation receipt exists',()=>{
    const r=decide([publicFile],{comments:[approval()]})
    expect(r.allowed).toBe(false)
    expect(r.kind).toBe('HUMAN_PUBLICATION')
    expect(r.reason).toMatch(/publication review hold/)
    expect(r.reason).toContain('positive PR-comment approval tokens are disabled')
    expect(r.reason).not.toContain('owner must post THS-PUBLICATION-APPROVED')
  })
  it('owner revocation after approval must close the publication gate',()=>{
    const revoked={...approval(sha,'Razzleberrytt',2),body:`THS-PUBLICATION-REVOKED PR=#6703 HEAD=${sha}`,created_at:'2026-10-12T17:00:00Z'}
    expect(decide([publicFile],{comments:[approval(),revoked]}).allowed).toBe(false)
  })
  it('does not mistake unproven GitHub review authorship for a direct human approval',()=>{
    const prior={id:1, user:{login:'Razzleberrytt',type:'User'},commit_id:sha, state:'APPROVED',submitted_at:'2026-10-12T16:00:00Z'}
    const change={...prior,id:2,state:'CHANGES_REQUESTED',submitted_at:'2026-10-12T17:00:00Z'}
    // GitHub REST review responses may not include app-origin provenance.
    expect(decide([publicFile],{reviews:[prior]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,performed_via_github_app:{slug:'chatgpt-codex-connector'}}]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,performed_via_github_app:null}]}).allowed).toBe(true)
    expect(decide([publicFile],{reviews:[{...prior,performed_via_github_app:null},change]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,commit_id:older}]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[{...prior,user:{login:'other',type:'User'}}]}).allowed).toBe(false)
  })
  it('blocks app-authored and origin-unknown owner approval comments even when username is Owner',()=>{
    const asApp={...approval(),performed_via_github_app:{slug:'chatgpt-codex-connector',id:1144995}}
    const originUnknown={...approval()}
    delete originUnknown.performed_via_github_app
    expect(decide([publicFile],{comments:[asApp]}).allowed).toBe(false)
    expect(decide([publicFile],{comments:[originUnknown]}).allowed).toBe(false)
    expect(decide([publicFile],{comments:[approval()]}).allowed).toBe(false)
  })
  it('blocks approval even from same-second edited-comment ambiguity',()=>{
    const original=approval()
    const sameSecond={...original,created_at:'2026-10-12T16:00:00Z',updated_at:'2026-10-12T16:00:00Z'}
    expect(decide([publicFile],{comments:[sameSecond]}).allowed).toBe(false)
    expect(decide([publicFile],{comments:[{...sameSecond,id:22}]}).allowed).toBe(false)
  })
  it('rejects edited or timestamp-unknown owner comments, including a collaborator edit',()=>{
    const original=approval()
    const edited={...original,updated_at:'2026-10-12T16:01:00Z'}
    const missingUpdated={...original}
    delete missingUpdated.updated_at
    const missingCreated={...original}
    delete missingCreated.created_at
    const invalid={...original,updated_at:'not-a-timestamp'}
    expect(decide([publicFile],{comments:[original]}).allowed).toBe(false)
    for(const c of [edited,missingUpdated,missingCreated,invalid]){
      expect(decide([publicFile],{comments:[c]}).allowed).toBe(false)
    }
    // Retyping the right token into an existing owner's prior comment after
    // a different person edited it must NOT inherit the original owner.
    const alteredByCollaborator={...original,id:99,created_at:'2026-10-11T16:00:00Z',updated_at:'2026-10-12T16:00:00Z'}
    expect(decide([publicFile],{comments:[alteredByCollaborator]}).allowed).toBe(false)
  })
  it('honors negative reviews/revocations after a separately proven review',()=>{
    const prior={id:1,user:{login:'Razzleberrytt',type:'User'},
      commit_id:sha,state:'APPROVED',performed_via_github_app:null,
      submitted_at:'2026-10-12T16:00:00Z'}
    const revoked={...approval(sha,'Razzleberrytt',2),
      body:`THS-PUBLICATION-REVOKED PR=#6703 HEAD=${sha}`,
      performed_via_github_app:{slug:'chatgpt-codex-connector'},
      created_at:'2026-10-12T17:00:00Z'}
    const changed={id:3,user:{login:'Razzleberrytt',type:'User'},
      commit_id:sha,state:'CHANGES_REQUESTED',submitted_at:'2026-10-12T18:00:00Z'}
    expect(decide([publicFile],{comments:[revoked],reviews:[prior]}).allowed).toBe(false)
    expect(decide([publicFile],{reviews:[prior,changed]}).allowed).toBe(false)
  })
  it('same-second revocation overrides a higher-ID approved review',()=>{
    const review={id:9000001,user:{login:'Razzleberrytt',type:'User'},commit_id:sha,
      state:'APPROVED',performed_via_github_app:null,
      submitted_at:'2026-10-12T16:00:00Z'}
    const revoke={...approval(sha,'Razzleberrytt',4),
      body:`THS-PUBLICATION-REVOKED PR=#6703 HEAD=${sha}`,
      created_at:'2026-10-12T16:00:00Z',
      updated_at:'2026-10-12T16:00:00Z'}
    // Issue-comment IDs and review IDs are not chronologically comparable.
    expect(decide([publicFile],{comments:[revoke],reviews:[review]}).allowed).toBe(false)
    expect(decide([publicFile],{comments:[revoke],reviews:[{...review,id:1}]}).allowed).toBe(false)
  })
  it('same-second CHANGES_REQUESTED vetoes an apparently approved review',()=>{
    const a={id:9000001,user:{login:'Razzleberrytt',type:'User'},commit_id:sha,
      state:'APPROVED',performed_via_github_app:null,
      submitted_at:'2026-10-12T16:00:00Z'}
    const revoked={...a,id:1,state:'CHANGES_REQUESTED'}
    expect(decide([publicFile],{reviews:[a,revoked]}).allowed).toBe(false)
  })
  it('only an unambiguous later independently verified review can clear an earlier revocation',()=>{
    const a={id:12,user:{login:'Razzleberrytt',type:'User'},commit_id:sha,
      state:'APPROVED',performed_via_github_app:null,
      submitted_at:'2026-10-12T17:00:00Z'}
    const revoked={...a,id:100,state:'CHANGES_REQUESTED',
      submitted_at:'2026-10-12T16:00:00Z'}
    expect(decide([publicFile],{reviews:[a,revoked]}).allowed).toBe(true)
  })
  it('blocks when exact PR or base owner identity is missing',()=>{
    const tampered={...pr,base:{repo:{full_name:'Razzleberrytt/hippie-scientist-site'}}}
    expect(decide([publicFile],{pr:tampered,comments:[approval()]}).allowed).toBe(false)
    const fork={...pr,head:{...pr.head,repo:{full_name:'other/fork'}}}
    expect(decide([publicFile],{pr:fork,comments:[approval()]}).allowed).toBe(false)
  })
})

describe('integration into trusted merge readiness',()=>{
  const currentBase='c'.repeat(40)
  const targetPr={...pr,state:'open',draft:false,mergeable:true,mergeable_state:'clean',
    base:{...pr.base,sha:currentBase,ref:'main'},labels:[]}
  it('stops before an apparently green public PR without approval',()=>{
    const r=evaluateReadiness({
      pr:targetPr, workflowRuns:[],checkRuns:[],changedFiles:[publicFile],
      expectedHeadSha:sha,currentBaseSha:currentBase,
      riskTier:'high',controllerRunId:'test-controller',
    })
    expect(r.action).toBe('stop')
    expect(r.reason).toContain('publication review hold')
  })
  it('human approval cannot bypass required workflows or their failures',()=>{
    const r=evaluateReadiness({
      pr:targetPr,workflowRuns:[],checkRuns:[],changedFiles:[publicFile],
      approvalEvidence:{comments:[],reviews:[{
        id:1,user:{login:'Razzleberrytt',type:'User'},
        commit_id:sha,state:'APPROVED',performed_via_github_app:null,
        submitted_at:'2026-10-12T16:00:00Z'
      }]},
      expectedHeadSha:sha,currentBaseSha:currentBase,
      riskTier:'high',controllerRunId:'test-controller',
    })
    expect(r.action).toBe('wait')
    expect(r.reason).toContain('required workflows')
  })
})


describe('owner GPG-signed annotated release tags', () => {
  const ownerPr = {
    ...pr,
    base: { ...pr.base, repo: { ...pr.base.repo, owner: { login: 'Razzleberrytt', id: 216745723 } } },
  };
  const name = ownerSignedTagName(ownerPr.number, sha);
  const email = '216745723+Razzleberrytt@users.noreply.github.com';
  const message = 'THS-PUBLICATION-APPROVED PR=#6703 HEAD=' + sha;
  const timestamp = '2026-10-20T12:00:00Z';
  const payload = [
    'object ' + sha,
    'type commit',
    'tag ' + name,
    'tagger Razzleberrytt <' + email + '> ' + Date.parse(timestamp) / 1000 + ' +0000',
    '',
    message,
    '',
  ].join('\n');
  const validProof = {
    tagRef: { ref: 'refs/tags/' + name, object: { type: 'tag', sha: older } },
    tag: {
      sha: older, tag: name, object: { type: 'commit', sha },
      tagger: { name: 'Razzleberrytt', email, date: timestamp },
      message,
      verification: { verified: true, reason: 'valid', signature: '-----BEGIN PGP SIGNATURE-----\nproof\n-----END PGP SIGNATURE-----', payload },
    },
  };

  it('accepts only an exact-head owner-key GitHub-verified signed annotated tag', () => {
    expect(verifyOwnerSignedTag({ pr: ownerPr, ...validProof })).toEqual({
      approved: true, at: Date.parse(timestamp),
    });
    expect(assessPublicationApproval({pr: ownerPr, changedFiles:[publicFile],signedTagProof:validProof}).allowed).toBe(true);
    expect(ownerSignedTagName(999, 'not-a-sha')).toBeNull();
  });

  it('rejects identity substitution, replay and forged or unsigned release tags', () => {
    const mutate = (field, value) => ({
      ...validProof,
      tag: { ...validProof.tag, [field]: value },
    });
    const attempts = [
      { ...validProof, tagRef: { ...validProof.tagRef, ref: 'refs/tags/other' } },
      { ...validProof, tagRef: { ...validProof.tagRef, object: { type: 'commit', sha: older } } },
      { ...validProof, tagRef: { ...validProof.tagRef, object: { type: 'tag', sha } } },
      mutate('object', { type: 'commit', sha: older }),
      mutate('tagger', { ...validProof.tag.tagger, email:'attacker@example.com' }),
      mutate('message', 'approve all'),
      mutate('verification', { ...validProof.tag.verification, verified:false }),
      mutate('verification', { ...validProof.tag.verification, reason:'bad_email' }),
      mutate('verification', { ...validProof.tag.verification, signature:null }),
      mutate('verification', { ...validProof.tag.verification, payload:payload.replace('object '+sha,'object '+older) }),
      mutate('verification', { ...validProof.tag.verification, payload:payload+'appended text' }),
      mutate('verification', { ...validProof.tag.verification, payload:payload.replace(email,'attacker@example.com') }),
      mutate('tagger', { ...validProof.tag.tagger, date:'2026-10-19T12:00:00Z' }),
    ];
    for (const proof of attempts) {
      expect(assessPublicationApproval({pr:ownerPr,changedFiles:[publicFile],signedTagProof:proof}).allowed).toBe(false);
    }
    const moved={...ownerPr,head:{...ownerPr.head,sha:older}};
    expect(verifyOwnerSignedTag({pr:moved,...validProof})).toBeNull();
    const fork={...ownerPr,head:{...ownerPr.head,repo:{full_name:'other/evil'}}};
    expect(verifyOwnerSignedTag({pr:fork,...validProof})).toBeNull();
    expect(verifyOwnerSignedTag({pr,...validProof})).toBeNull();
  });

  it('keeps later negative owner revocations and same-second vetoes effective', () => {
    const revocation={...approval(sha,'Razzleberrytt',20),
      body:'THS-PUBLICATION-REVOKED PR=#6703 HEAD='+sha,
      created_at:'2026-10-20T12:00:00Z',
      updated_at:'2026-10-20T12:00:00Z'};
    expect(assessPublicationApproval({
      pr:ownerPr,changedFiles:[publicFile],signedTagProof:validProof,comments:[revocation],
    }).allowed).toBe(false);
    const later={...revocation,created_at:'2026-10-20T12:01:00Z',updated_at:'2026-10-20T12:01:00Z'};
    expect(assessPublicationApproval({
      pr:ownerPr,changedFiles:[publicFile],signedTagProof:validProof,comments:[later],
    }).allowed).toBe(false);
    // Signed tags do not relieve CI or independently verified source checks.
    expect(evaluateReadiness({
      pr:{...ownerPr,state:'open',draft:false,mergeable:true,mergeable_state:'clean',
        base:{...ownerPr.base,sha:'c'.repeat(40),ref:'main'},labels:[]},
      workflowRuns:[],checkRuns:[],changedFiles:[publicFile],
      approvalEvidence:{comments:[],reviews:[],signedTagProof:validProof},
      expectedHeadSha:sha,currentBaseSha:'c'.repeat(40),riskTier:'high',
    }).action).toBe('wait');
  });

  it('reads trusted tag objects from GitHub and holds missing tags safely', async () => {
    const requests=[];
    const mock = async url => {
      requests.push(url);
      if (url.includes('/git/ref/tags/')) return validProof.tagRef;
      if (url.includes('/git/tags/')) return validProof.tag;
      return [];
    };
    const evidence = await loadPublicationApprovalEvidence(mock,'Razzleberrytt/hippie-scientist-site',ownerPr.number,[publicFile],ownerPr);
    expect(evidence.signedTagProof).toEqual(validProof);
    expect(requests).toContain('/repos/Razzleberrytt/hippie-scientist-site/git/ref/tags/'+name);
    const missing = await loadPublicationApprovalEvidence(async url => {
      if (url.includes('/git/ref/tags/')) throw Object.assign(new Error('not found'),{status:404});
      return [];
    },'Razzleberrytt/hippie-scientist-site',ownerPr.number,[publicFile],ownerPr);
    expect(missing.signedTagProof).toBeNull();
    await expect(loadPublicationApprovalEvidence(async url=>{
      if(url.includes('/git/ref/tags/')) throw Object.assign(new Error('unauthorized'),{status:403});
      return [];
    },'Razzleberrytt/hippie-scientist-site',ownerPr.number,[publicFile],ownerPr)).rejects.toThrow('unauthorized');
  });
});
