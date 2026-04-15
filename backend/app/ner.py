from collections import defaultdict
from itertools import combinations

import spacy

from app.config import settings


_nlp = None


def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load(settings.spacy_model)
    return _nlp


def extract_entities_and_relations(text: str) -> tuple[dict, list]:
    nlp = get_nlp()
    doc = nlp(text)

    entities = defaultdict(set)
    for ent in doc.ents:
        entities[ent.label_].add(ent.text.strip())

    normalized_entities = {label: sorted(values) for label, values in entities.items()}

    relations = []
    for sent in doc.sents:
        sent_entities = [(ent.text.strip(), ent.label_) for ent in sent.ents]
        for (src_text, src_label), (dst_text, dst_label) in combinations(sent_entities, 2):
            if src_text != dst_text:
                relations.append(
                    {
                        "source": {"text": src_text, "label": src_label},
                        "target": {"text": dst_text, "label": dst_label},
                        "relation": "co_occurs_in_sentence",
                        "context": sent.text.strip(),
                    }
                )

    return normalized_entities, relations
