# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Claude-specific notes

- After changing UI, check it visually: `npm run preview`, then take headless Chrome screenshots of `/` and `/en/` at mobile (390 px) and desktop (1440 px) widths.
- Rendering SVG with ImageMagick drops stroked paths (e.g. the logo wordmark); use headless Chrome instead.
