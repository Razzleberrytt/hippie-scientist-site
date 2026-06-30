#!/usr/bin/env python3
"""Enrich compound data files that don't meet quality thresholds using LLM."""
import json, time, sys, os
from openai import OpenAI

BATCH_SIZE = 25
MODEL = "openai/gpt-5.4-nano"
DATA_DIR = "public/data/compounds-detail"
IMPROVE_FILE = "ops/publish-input/compounds-to-improve.json"

client = OpenAI(base_url="http://127.0.0.1:18080/api/v1", api_key="x")

def enrich_batch(compounds):
    """Send a batch of compounds to the LLM for enrichment."""
    compounds_list = []
    for c in compounds:
        compounds_list.append({
            "slug": c["slug"],
            "name": c["name"],
            "current_description": c["desc"],
            "current_mechanisms_count": c["mechanisms"],
        })
    
    prompt = f"""You are enriching supplement/herb compound data for an evidence-based reference site.

For each of the {len(compounds_list)} compounds below, provide:
1. An enriched "description" (100-200 chars) that adds biological context, mechanism relevance, and practical framing. Keep the existing tone — evidence-forward, not marketing.
2. An array of 3-6 "mechanisms" (short phrases like "Inflammatory Signaling Modulation", "Oxidative Stress Modulation", "Mitochondrial Support"). Use the existing style — capitalize first letters, use known pharmacological mechanism names.

IMPORTANT: For each compound, preserve the existing description's core claim/intent. Only expand it with more biological context.

Return ONLY valid JSON in this exact format:
{{
  "compounds": [
    {{
      "slug": "compound-slug",
      "description": "Enriched description text here...",
      "mechanisms": ["Mechanism One", "Mechanism Two", "Mechanism Three"]
    }}
  ]
}}

Compounds to enrich:
{json.dumps(compounds_list, indent=2)}"""

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=8000,
    )
    return resp.choices[0].message.content

def apply_enrichment(enriched_data):
    """Write enriched data back to compound JSON files."""
    results = {"enriched": 0, "flipped": 0, "errors": 0}
    
    for comp in enriched_data.get("compounds", []):
        slug = comp["slug"]
        filepath = os.path.join(DATA_DIR, f"{slug}.json")
        
        try:
            with open(filepath) as f:
                data = json.load(f)
            
            # Update description
            if comp.get("description") and len(comp["description"]) > len(data.get("description", "") or ""):
                data["description"] = comp["description"]
            
            # Update mechanisms (merge, deduplicate)
            existing_mechs = set(data.get("mechanisms", []) or [])
            new_mechs = comp.get("mechanisms", [])
            for m in new_mechs:
                if m not in existing_mechs:
                    existing_mechs.add(m)
            data["mechanisms"] = list(existing_mechs)
            
            # Flip to PUBLISH if quality threshold met
            desc = data.get("description", "") or ""
            mechs = len(data.get("mechanisms", []) or [])
            if len(desc) > 80 and mechs >= 3:
                data["indexability_status"] = "PUBLISH"
                data["robots"] = "index,follow"
                if "governance" in data:
                    data["governance"]["indexingAllowed"] = True
                results["flipped"] += 1
            
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2)
            
            results["enriched"] += 1
            print(f"  ✓ {slug}: desc={len(desc)}ch, mechs={mechs}")
            
        except Exception as e:
            results["errors"] += 1
            print(f"  ✗ {slug}: {e}")
    
    return results

def main():
    with open(IMPROVE_FILE) as f:
        to_improve = json.load(f)
    
    print(f"Enriching {len(to_improve)} compounds in batches of {BATCH_SIZE}...")
    
    total = {"enriched": 0, "flipped": 0, "errors": 0}
    
    for i in range(0, len(to_improve), BATCH_SIZE):
        batch = to_improve[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (len(to_improve) + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"\n=== Batch {batch_num}/{total_batches} ({len(batch)} compounds) ===")
        
        for attempt in range(3):
            try:
                result = enrich_batch(batch)
                # Extract JSON from response
                # Find the first { and last }
                start = result.find('{')
                end = result.rfind('}') + 1
                json_str = result[start:end]
                enriched = json.loads(json_str)
                
                batch_results = apply_enrichment(enriched)
                for k in total:
                    total[k] += batch_results[k]
                break
            except Exception as e:
                print(f"  Attempt {attempt+1} failed: {e}")
                if attempt == 2:
                    print(f"  Giving up on batch {batch_num}")
                time.sleep(2)
        
        # Small delay between batches
        if i + BATCH_SIZE < len(to_improve):
            time.sleep(1)
    
    print(f"\n=== DONE ===")
    print(f"Enriched: {total['enriched']}")
    print(f"Flipped to PUBLISH: {total['flipped']}")
    print(f"Errors: {total['errors']}")

if __name__ == "__main__":
    main()
