"""Source-locked, research-only caption timing windows for EvidenceMotion.

Never edits the original WAV, word order, pronunciation, or scientific copy.
Window planning is not proof of decoded pixels or audience comprehension.
"""
import math
import re

SCHEMA = 'ths-evidencemotion-timed-caption-windows-v1'
PROTECTED = frozenset({'not', 'no', 'never', 'cannot', "can't", 'without'})


def _clean_word(word):
    return re.sub(r"^[^\w]+|[^\w]+$", '', word.casefold())


def _validate(cues):
    if not isinstance(cues, list):
        raise ValueError('CAPTION_WINDOW_HOLD:CUES_NOT_LIST')
    last_end = -math.inf
    for idx, c in enumerate(cues):
        if not isinstance(c, dict) or not isinstance(c.get('text'), str) or not c['text'].strip():
            raise ValueError('CAPTION_WINDOW_HOLD:MISSING_SPOKEN_WORD')
        if len(c['text'].split()) != 1:
            raise ValueError('CAPTION_WINDOW_HOLD:WORD_CUE_MUST_BE_ATOMIC')
        a,b = c.get('startSec'),c.get('endSec')
        if (isinstance(a,bool) or isinstance(b,bool) or not isinstance(a,(float,int))
                or not isinstance(b,(float,int)) or not math.isfinite(a)
                or not math.isfinite(b) or a < 0 or b <= a):
            raise ValueError('CAPTION_WINDOW_HOLD:INVALID_TIME_BOUND')
        if a < last_end-1e-7:
            raise ValueError('CAPTION_WINDOW_HOLD:OVERLAPPING_WORD_CUES')
        last_end = b


def schedule(cues, *, max_words=3):
    """Return bounded contiguous cue groups; protected negation begins a group."""
    _validate(cues)
    if not isinstance(max_words,int) or isinstance(max_words,bool) or max_words < 1:
        raise ValueError('CAPTION_WINDOW_HOLD:INVALID_MAX_WORDS')
    groups=[]
    idx=0
    while idx<len(cues):
        end=min(idx+max_words,len(cues))
        for j in range(idx+1,end):
            if _clean_word(cues[j]['text']) in PROTECTED:
                end=j
                break
        if end==idx:
            raise ValueError('CAPTION_WINDOW_HOLD:ZERO_LENGTH_GROUP')
        group=cues[idx:end]
        groups.append({'firstCue':idx,'afterLastCue':end,
                       'startSec':group[0]['startSec'],
                       'endSec':group[-1]['endSec'],
                       'words':[x['text'] for x in group],
                       # Preserve exact acoustic onset per cue. A group is a
                       # layout limit, never permission to pre-display words.
                       'wordCues':[{'text':x['text'],
                                    'startSec':x['startSec'],
                                    'endSec':x['endSec']} for x in group]})
        idx=end
    if [w for g in groups for w in g['words']]!=[c['text'] for c in cues]:
        raise ValueError('CAPTION_WINDOW_HOLD:SOURCE_WORD_DRIFT')
    return groups


def shown_at(groups, second):
    """Return *one* group when its spoken onset has occurred, never before."""
    if (type(second) not in (float,int) or not math.isfinite(second)):
        raise ValueError('CAPTION_WINDOW_HOLD:INVALID_SAMPLE_TIME')
    active=None
    for group in groups:
        if group['startSec'] <= second:
            active=group
        else:
            break
    if active is None or second >= active['endSec']:
        return []
    # Word timing, not group timing, controls reveal. This also prevents
    # future qualifiers, scientific terms and repeated words from leaking.
    return [cue['text'] for cue in active['wordCues']
            if cue['startSec'] <= second]
