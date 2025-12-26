"""Weekly digest generation service."""

import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from config import PROJECT_ROOT, REPORTS_DIR, LOGS_DIR

logger = logging.getLogger(__name__)


@dataclass
class DigestReport:
    """A report included in the digest."""
    title: str
    type: str
    date: str
    path: str
    key_takeaways: List[str]


@dataclass
class DigestStats:
    """Statistics for the digest period."""
    total_reports: int
    by_type: Dict[str, int]
    days_active: int
    streak: int


def get_reports_in_range(start_date: datetime, end_date: datetime) -> List[Path]:
    """Get all report files within a date range."""
    reports = []

    for category_dir in REPORTS_DIR.iterdir():
        if not category_dir.is_dir():
            continue

        for report_file in category_dir.glob("*.md"):
            # Extract date from filename (YYYY-MM-DD_title.md)
            try:
                date_str = report_file.stem[:10]
                report_date = datetime.strptime(date_str, "%Y-%m-%d")

                if start_date <= report_date <= end_date:
                    reports.append(report_file)
            except ValueError:
                continue

    return sorted(reports, key=lambda p: p.stem, reverse=True)


def extract_report_summary(report_path: Path) -> DigestReport:
    """Extract key information from a report for the digest."""
    content = report_path.read_text(encoding="utf-8", errors="replace")
    lines = content.split("\n")

    # Extract title (first H1)
    title = "Untitled"
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
            break

    # Detect type from path
    report_type = report_path.parent.name
    type_map = {
        "youtube": "Video",
        "articles": "Article",
        "papers": "Paper",
        "podcasts": "Podcast",
        "pdfs": "PDF",
        "github": "GitHub",
        "books": "Book",
        "newsletters": "Newsletter",
        "threads": "Thread",
        "hackernews": "HN Post",
        "other": "Other",
    }
    display_type = type_map.get(report_type, report_type.title())

    # Extract date
    date_str = report_path.stem[:10]

    # Extract key takeaways (look for numbered list after "Key Takeaways" header)
    takeaways = []
    in_takeaways = False

    for line in lines:
        if "key takeaway" in line.lower() or "main points" in line.lower():
            in_takeaways = True
            continue

        if in_takeaways:
            if line.startswith("## "):
                break  # Next section
            if line.strip().startswith(("1.", "2.", "3.", "4.", "5.", "-", "*")):
                # Clean up the takeaway
                takeaway = line.strip().lstrip("0123456789.-*) ").strip()
                if takeaway and len(takeaway) > 10:
                    takeaways.append(takeaway[:200])  # Limit length
                    if len(takeaways) >= 3:
                        break

    return DigestReport(
        title=title,
        type=display_type,
        date=date_str,
        path=str(report_path.relative_to(PROJECT_ROOT)),
        key_takeaways=takeaways[:3],
    )


def calculate_stats(reports: List[Path], start_date: datetime, end_date: datetime) -> DigestStats:
    """Calculate statistics for the digest period."""
    by_type: Dict[str, int] = {}

    for report in reports:
        report_type = report.parent.name
        by_type[report_type] = by_type.get(report_type, 0) + 1

    # Calculate days active
    active_dates = set()
    for report in reports:
        try:
            date_str = report.stem[:10]
            active_dates.add(date_str)
        except:
            pass

    # Calculate streak (consecutive days ending at end_date)
    streak = 0
    check_date = end_date
    while check_date >= start_date:
        date_str = check_date.strftime("%Y-%m-%d")
        if date_str in active_dates:
            streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    return DigestStats(
        total_reports=len(reports),
        by_type=by_type,
        days_active=len(active_dates),
        streak=streak,
    )


def generate_digest_content(
    reports: List[DigestReport],
    stats: DigestStats,
    start_date: datetime,
    end_date: datetime,
    title: Optional[str] = None,
) -> str:
    """Generate the markdown content for a digest."""
    date_range = f"{start_date.strftime('%B %d')} - {end_date.strftime('%B %d, %Y')}"

    if not title:
        title = f"Weekly Digest: {date_range}"

    # Build content
    content = f"""# {title}

**Period**: {date_range}
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Type**: Weekly Digest

---

## Summary

This week you consumed **{stats.total_reports} pieces of content** across **{stats.days_active} days**.

"""

    # Stats by type
    if stats.by_type:
        content += "### By Type\n\n"
        for type_name, count in sorted(stats.by_type.items(), key=lambda x: -x[1]):
            emoji = {
                "youtube": "🎬",
                "articles": "📰",
                "papers": "📄",
                "podcasts": "🎙️",
                "books": "📚",
                "github": "💻",
                "newsletters": "📧",
            }.get(type_name, "📝")
            content += f"- {emoji} **{type_name.title()}**: {count}\n"
        content += "\n"

    # Streak info
    if stats.streak > 1:
        content += f"🔥 **{stats.streak}-day streak!** Keep it up!\n\n"

    content += "---\n\n## Content Analyzed\n\n"

    # Group reports by type
    by_type: Dict[str, List[DigestReport]] = {}
    for report in reports:
        if report.type not in by_type:
            by_type[report.type] = []
        by_type[report.type].append(report)

    for type_name, type_reports in by_type.items():
        content += f"### {type_name}s\n\n"

        for report in type_reports:
            content += f"#### [{report.title}]({report.path})\n"
            content += f"*{report.date}*\n\n"

            if report.key_takeaways:
                content += "**Key Points:**\n"
                for takeaway in report.key_takeaways:
                    content += f"- {takeaway}\n"
                content += "\n"

        content += "\n"

    # Closing
    content += """---

## Reflection Prompts

1. What was the most surprising insight this week?
2. Which content do you want to revisit or act on?
3. Are there patterns in what you're consuming?

---

## My Notes

"""

    return content


async def generate_weekly_digest(
    weeks_ago: int = 0,
    custom_title: Optional[str] = None,
) -> Path:
    """
    Generate a weekly digest report.

    Args:
        weeks_ago: 0 for current week, 1 for last week, etc.
        custom_title: Optional custom title for the digest

    Returns:
        Path to the generated digest file
    """
    # Calculate date range
    today = datetime.now()
    # Start of current week (Monday)
    start_of_week = today - timedelta(days=today.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)

    # Adjust for weeks_ago
    start_date = start_of_week - timedelta(weeks=weeks_ago)
    end_date = start_date + timedelta(days=6, hours=23, minutes=59, seconds=59)

    # Ensure we don't go past today
    if end_date > today:
        end_date = today

    logger.info(f"Generating digest for {start_date.date()} to {end_date.date()}")

    # Get reports in range
    report_paths = get_reports_in_range(start_date, end_date)

    if not report_paths:
        raise ValueError(f"No reports found for the period {start_date.date()} to {end_date.date()}")

    # Extract summaries
    reports = [extract_report_summary(p) for p in report_paths]

    # Calculate stats
    stats = calculate_stats(report_paths, start_date, end_date)

    # Generate content
    content = generate_digest_content(reports, stats, start_date, end_date, custom_title)

    # Save digest
    digests_dir = REPORTS_DIR / "digests"
    digests_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{start_date.strftime('%Y-%m-%d')}_weekly-digest.md"
    digest_path = digests_dir / filename

    digest_path.write_text(content, encoding="utf-8")
    logger.info(f"Saved digest to {digest_path}")

    # Update activity log
    log_file = LOGS_DIR / f"{datetime.now().strftime('%Y-%m-%d')}.md"
    LOGS_DIR.mkdir(parents=True, exist_ok=True)

    log_entry = f"\n## Digests Generated\n\n- [Weekly Digest: {start_date.strftime('%b %d')} - {end_date.strftime('%b %d')}](../reports/digests/{filename}) - {datetime.now().strftime('%H:%M')}\n"

    if log_file.exists():
        existing = log_file.read_text()
        if "## Digests Generated" not in existing:
            log_file.write_text(existing + log_entry)
    else:
        log_file.write_text(f"# Activity Log - {datetime.now().strftime('%Y-%m-%d')}\n" + log_entry)

    return digest_path


async def generate_monthly_digest(
    months_ago: int = 0,
    custom_title: Optional[str] = None,
) -> Path:
    """Generate a monthly digest report."""
    today = datetime.now()

    # Calculate month range
    if months_ago == 0:
        start_date = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = today
    else:
        # Go back months_ago months
        month = today.month - months_ago
        year = today.year
        while month <= 0:
            month += 12
            year -= 1

        start_date = datetime(year, month, 1)

        # End of that month
        if month == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
        else:
            end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)

    logger.info(f"Generating monthly digest for {start_date.date()} to {end_date.date()}")

    # Get reports
    report_paths = get_reports_in_range(start_date, end_date)

    if not report_paths:
        raise ValueError(f"No reports found for {start_date.strftime('%B %Y')}")

    # Extract summaries
    reports = [extract_report_summary(p) for p in report_paths]

    # Calculate stats
    stats = calculate_stats(report_paths, start_date, end_date)

    # Generate content
    title = custom_title or f"Monthly Digest: {start_date.strftime('%B %Y')}"
    content = generate_digest_content(reports, stats, start_date, end_date, title)

    # Save
    digests_dir = REPORTS_DIR / "digests"
    digests_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{start_date.strftime('%Y-%m')}_monthly-digest.md"
    digest_path = digests_dir / filename

    digest_path.write_text(content, encoding="utf-8")
    logger.info(f"Saved monthly digest to {digest_path}")

    return digest_path
