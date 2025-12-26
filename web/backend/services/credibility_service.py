"""
Source Credibility Analysis Service.

Analyzes the credibility of content sources using AI and heuristics.
"""

import logging
import re
from typing import Optional
from urllib.parse import urlparse

from anthropic import Anthropic

from config import ANTHROPIC_API_KEY, MODELS

logger = logging.getLogger(__name__)

# Known source reliability indicators
TRUSTED_DOMAINS = {
    'nature.com': 0.95,
    'science.org': 0.95,
    'arxiv.org': 0.90,
    'nih.gov': 0.95,
    'edu': 0.85,  # .edu domains
    'gov': 0.85,  # .gov domains
    'bbc.com': 0.80,
    'reuters.com': 0.85,
    'apnews.com': 0.85,
    'nytimes.com': 0.75,
    'theguardian.com': 0.75,
}

CREDIBILITY_PROMPT = """Analyze the credibility of the following content. Consider:

1. **Source Quality**: Is this from a reputable source? Academic, journalistic, or expert?
2. **Evidence & Citations**: Does it cite sources? Use data? Provide references?
3. **Author Expertise**: Any indication of author qualifications?
4. **Bias Indicators**: Loaded language? One-sided arguments? Hidden agenda?
5. **Fact Checkability**: Can claims be verified? Are they specific?
6. **Logical Consistency**: Sound reasoning? Any logical fallacies?

Content to analyze:
Title: {title}
Source: {source}
Type: {content_type}

Content:
{content}

Provide your analysis as JSON:
{{
  "overall_score": <1-100>,
  "source_quality": {{"score": <1-100>, "notes": "..."}},
  "evidence_quality": {{"score": <1-100>, "notes": "..."}},
  "bias_level": {{"score": <1-100 where 100=unbiased>, "notes": "..."}},
  "fact_checkability": {{"score": <1-100>, "notes": "..."}},
  "red_flags": ["list", "of", "concerns"],
  "strengths": ["list", "of", "positives"],
  "recommendation": "brief recommendation for the reader"
}}"""


def get_client() -> Anthropic:
    """Get Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def get_domain_score(url: str) -> float:
    """Get base credibility score from domain."""
    if not url:
        return 0.5

    try:
        domain = urlparse(url).netloc.lower()
        domain = domain.replace('www.', '')

        # Check exact matches
        if domain in TRUSTED_DOMAINS:
            return TRUSTED_DOMAINS[domain]

        # Check TLD matches
        tld = domain.split('.')[-1]
        if tld in TRUSTED_DOMAINS:
            return TRUSTED_DOMAINS[tld]

        # YouTube gets medium score
        if 'youtube.com' in domain or 'youtu.be' in domain:
            return 0.60

        # Default for unknown domains
        return 0.50

    except Exception:
        return 0.50


async def analyze_credibility(
    content: str,
    title: str,
    source_url: str,
    content_type: str,
) -> dict:
    """
    Analyze the credibility of content.

    Returns credibility scores and analysis.
    """
    try:
        # Get domain-based score
        domain_score = get_domain_score(source_url)

        # Truncate content
        if len(content) > 10000:
            content = content[:10000] + "\n\n[Content truncated...]"

        # Build prompt
        prompt = CREDIBILITY_PROMPT.format(
            title=title,
            source=source_url or "Unknown",
            content_type=content_type,
            content=content,
        )

        # Call Claude
        client = get_client()
        model_info = MODELS["haiku"]  # Use Haiku for cost efficiency

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        # Parse response
        import json
        response_text = response.content[0].text

        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            analysis = json.loads(json_match.group(0))
        else:
            analysis = {"overall_score": 50, "error": "Failed to parse analysis"}

        # Combine with domain score
        ai_score = analysis.get("overall_score", 50)
        combined_score = (ai_score * 0.7) + (domain_score * 100 * 0.3)

        return {
            "overall_score": round(combined_score),
            "domain_score": round(domain_score * 100),
            "ai_score": ai_score,
            "source_quality": analysis.get("source_quality", {}),
            "evidence_quality": analysis.get("evidence_quality", {}),
            "bias_level": analysis.get("bias_level", {}),
            "fact_checkability": analysis.get("fact_checkability", {}),
            "red_flags": analysis.get("red_flags", []),
            "strengths": analysis.get("strengths", []),
            "recommendation": analysis.get("recommendation", ""),
        }

    except Exception as e:
        logger.exception(f"Credibility analysis failed: {e}")
        return {
            "overall_score": 50,
            "error": str(e),
        }
