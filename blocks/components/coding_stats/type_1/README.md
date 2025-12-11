# Coding Stats Component - Type 1

## Version
- **Version:** 1.0.0
- **Created:** December 2024
- **Author:** Portfolio Framework

## Description
Displays coding practice statistics from platforms like LeetCode, HackerRank, or CodeForces. Shows problem-solving metrics, difficulty breakdown, rankings, and achievements.

## Features
- Platform profile card with logo and link
- Total problems solved counter
- Difficulty breakdown with progress bars (Easy/Medium/Hard)
- Additional stats grid (Acceptance Rate, Ranking, Contest Rating, Streak)
- Achievements/badges section
- Full theme support (light/dark)
- Responsive design
- Dynamic loading support
- Navigation state handler integration

## File Structure
```
coding_stats/type_1/
├── coding_stats_structure_t1.html    # HTML template
├── coding_stats_style_t1.css         # Component styles
├── coding_stats_behavior_t1.js       # JavaScript behavior
├── coding_stats_loader_t1.php        # PHP loader
├── coding_stats_data_schema.json     # Data schema
└── README.md                         # This file
```

## Usage

### Page Definition
```json
{
    "type": "component",
    "component": "coding_stats/type_1",
    "id": "my-coding-stats",
    "dynamic": false,
    "variant": "main",
    "data": {
        "main": {
            "platform": "LeetCode",
            "username": "your_username",
            "profileUrl": "https://leetcode.com/your_username",
            "stats": {
                "totalSolved": 250,
                "easy": { "solved": 100, "total": 800 },
                "medium": { "solved": 120, "total": 1700 },
                "hard": { "solved": 30, "total": 750 },
                "acceptanceRate": "65%",
                "ranking": 50000,
                "contestRating": 1650,
                "streak": 30
            },
            "badges": ["50 Days Badge", "100 Problems", "Knight Badge"]
        }
    },
    "navigation": {
        "defaultState": "visible",
        "allowedStates": ["visible", "hidden", "scrollTo"]
    }
}
```

### Dynamic Loading
Set `"dynamic": true` in the page definition to enable lazy loading.

### Protected Content
Add `"protected": true` to navigation config for authenticated-only content.

## Navigation Handler
The component exports `handleCodingStatsNavigation(elementId, state, parameters)` for GlobalNavigator integration.

### Supported States
- `visible` - Show component
- `hidden` - Hide component with fade animation
- `scrollTo` - Scroll to component

## Styling
All styles use CSS custom properties from the site theme:
- Colors: `--color-primary`, `--color-text-primary`, etc.
- Spacing: `--spacing-*` variables
- Typography: `--font-size-*`, `--font-weight-*`
- Borders: `--border-radius-*`, `--border-width-*`
- Shadows: `--shadow-card`, `--shadow-card-hover`

## Changelog
### 1.0.0 (December 2024)
- Initial release
- Platform card with profile link
- Difficulty breakdown with animated progress bars
- Stats grid with icons
- Badges section
- Full responsive design
- Light/dark theme support
- Dynamic loading support
- Navigation handler integration
