"""Translation Router - Multi-language support for reports."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, MODELS
from database import get_report_by_id

router = APIRouter()

LANGUAGES = {
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese (Simplified)",
    "ru": "Russian",
    "ar": "Arabic",
}


class TranslateRequest(BaseModel):
    target_language: str
    sections: list[str] = []  # Empty = translate all


class TranslationResponse(BaseModel):
    report_id: int
    original_title: str
    translated_title: str
    translated_content: str
    target_language: str
    language_name: str


def get_client() -> Anthropic:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")
    return Anthropic(api_key=ANTHROPIC_API_KEY)


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages."""
    return {"languages": [{"code": k, "name": v} for k, v in LANGUAGES.items()]}


@router.post("/{report_id}", response_model=TranslationResponse)
async def translate_report(report_id: int, request: TranslateRequest):
    """
    Translate a report to another language.

    Uses AI to provide natural, contextual translations.
    """
    if request.target_language not in LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Supported: {list(LANGUAGES.keys())}"
        )

    report = await get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    content = report.get("content", "")
    if not content:
        raise HTTPException(status_code=400, detail="Report has no content")

    language_name = LANGUAGES[request.target_language]

    # Truncate if too long
    if len(content) > 15000:
        content = content[:15000] + "\n\n[Content truncated...]"

    prompt = f"""Translate the following content to {language_name}.
Maintain the markdown formatting and structure.
Preserve technical terms where appropriate.
Make the translation natural and readable.

Content to translate:
{content}"""

    try:
        client = get_client()
        model_info = MODELS["haiku"]

        response = client.messages.create(
            model=model_info["id"],
            max_tokens=8192,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text

        # Extract translated title (first line)
        lines = translated.split('\n')
        translated_title = lines[0].replace('# ', '').strip() if lines else report["title"]

        return TranslationResponse(
            report_id=report_id,
            original_title=report["title"],
            translated_title=translated_title,
            translated_content=translated,
            target_language=request.target_language,
            language_name=language_name,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
