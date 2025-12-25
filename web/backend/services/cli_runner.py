"""Claude Code CLI integration via subprocess."""

import asyncio
import os
import re
from typing import AsyncGenerator, Optional
import logging

from config import PROJECT_ROOT
from database import update_job_status, update_job_progress

logger = logging.getLogger(__name__)


async def run_claude_code_command(
    command: str,
    argument: str,
    job_id: str,
    timeout: int = 300  # 5 minute timeout
) -> AsyncGenerator[str, None]:
    """
    Run a Claude Code slash command and stream output.

    Commands map to: /yt, /read, /arxiv, /analyze, /batch

    Yields output lines for SSE streaming.
    """
    full_command = f"/{command} {argument}"
    logger.info(f"Running Claude Code: {full_command}")

    # Update job status to running
    await update_job_status(job_id, "running")
    yield f"Starting analysis: {full_command}"

    try:
        # Run claude CLI with the command
        # Format: claude -p "prompt" (--print mode with prompt as positional arg)
        process = await asyncio.create_subprocess_exec(
            "claude",
            "-p",  # Non-interactive mode (--print)
            full_command,  # The prompt/command
            "--output-format", "text",
            cwd=str(PROJECT_ROOT),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env={**os.environ, "FORCE_COLOR": "0", "NO_COLOR": "1", "CI": "1"},
        )

        output_lines = []
        yield "Waiting for Claude Code response..."

        try:
            # Read stdout and stderr with timeout
            stdout, stderr = await asyncio.wait_for(
                process.communicate(),
                timeout=timeout
            )

            # Process stdout
            if stdout:
                for line in stdout.decode("utf-8", errors="replace").split("\n"):
                    line = line.strip()
                    if line:
                        output_lines.append(line)
                        await update_job_progress(job_id, line)
                        yield line

            # Check for errors
            if process.returncode == 0:
                report_path = parse_report_path_from_output(output_lines)
                await update_job_status(job_id, "completed", result_filepath=report_path)
                yield "[COMPLETED] Report saved"
            else:
                # Include stderr in error message
                stderr_text = stderr.decode("utf-8", errors="replace") if stderr else ""
                error_msg = stderr_text or "\n".join(output_lines[-5:]) or "Unknown error"
                await update_job_status(job_id, "failed", error_message=error_msg)
                yield f"[FAILED] {error_msg}"

        except asyncio.TimeoutError:
            process.kill()
            await update_job_status(job_id, "failed", error_message="Analysis timed out after 5 minutes")
            yield "[FAILED] Analysis timed out"

    except FileNotFoundError:
        error_msg = "Claude CLI not found. Make sure 'claude' is installed and in PATH."
        await update_job_status(job_id, "failed", error_message=error_msg)
        yield f"[ERROR] {error_msg}"

    except Exception as e:
        error_msg = f"Error running Claude CLI: {str(e)}"
        logger.exception("CLI runner error")
        await update_job_status(job_id, "failed", error_message=error_msg)
        yield f"[ERROR] {error_msg}"


def parse_report_path_from_output(lines: list[str]) -> Optional[str]:
    """Extract report filepath from Claude Code output."""
    for line in reversed(lines):
        # Look for report path patterns
        if "reports/" in line and ".md" in line:
            # Match: reports/youtube/2025-12-23_title.md
            match = re.search(r"reports/\w+/[\w\-]+\.md", line)
            if match:
                return match.group(0)

        # Also check for full path
        if "reports" in line and ".md" in line:
            match = re.search(r"[A-Za-z]:.*?reports[\\/]\w+[\\/][\w\-]+\.md", line)
            if match:
                return match.group(0).replace("\\", "/")

    return None


async def check_claude_cli_available() -> bool:
    """Check if Claude CLI is available."""
    try:
        process = await asyncio.create_subprocess_exec(
            "claude", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        await process.wait()
        return process.returncode == 0
    except FileNotFoundError:
        return False
