from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas import HelpArticleResponse

router = APIRouter(prefix="/help", tags=["Help Centre & User Guide"])

HELP_ARTICLES: List[dict] = [
    {
        "id": "faq-anonymity",
        "role_target": "student",
        "category": "FAQ",
        "title": "Can mess staff or wardens see who rated a dish?",
        "summary": "No. Ratings are strictly anonymous by design.",
        "content": "No staff member, cook, or warden can ever see which student submitted a rating. Student user IDs are kept strictly isolated on the server to prevent duplicate votes for the same meal. Furthermore, a dish's average rating is never shown until at least five students have rated it, guaranteeing that individual opinions cannot be identified."
    },
    {
        "id": "student-skip-meal",
        "role_target": "student",
        "category": "How-To",
        "title": "How to Skip a Meal and understand the Cut-off time",
        "summary": "Mark your absence early so the kitchen cooks less food.",
        "content": "Open the Today screen, find the upcoming meal slot, and tap 'Skip Meal'. A clear cut-off time is displayed (typically 60 minutes before meal service begins). You can undo your skip anytime before the cut-off. Once the cut-off passes, the button locks so the kitchen team has stable, reliable numbers to cook against."
    },
    {
        "id": "student-rating-5s",
        "role_target": "student",
        "category": "How-To",
        "title": "5-Second Meal Rating",
        "summary": "Two taps to make your voice heard.",
        "content": "MessPulse is built around the principle: 'Five seconds or it won't happen'. Tap a 1-5 star rating on any served dish or the overall meal slot. You can optionally tap quick reason tags (such as 'Too Salty', 'Oily', 'Cold', or 'Great Taste') and leave a brief comment before tapping Submit."
    },
    {
        "id": "staff-daily-entry",
        "role_target": "staff",
        "category": "How-To",
        "title": "Staff Daily Entry: Headcount and Leftover kg",
        "summary": "Entering the three numbers that drive waste reduction.",
        "content": "After service, open the Daily Entry screen on your phone or counter tablet. 1. Enter the total number of students served. 2. Enter the weighed leftover kilograms for each served dish. 3. Tap 'Save Entry'. These figures instantly update the waste-per-head analytics."
    },
    {
        "id": "staff-expected-headcount",
        "role_target": "staff",
        "category": "Concepts",
        "title": "Understanding Expected Headcount",
        "summary": "How the kitchen knows how much to cook.",
        "content": "Expected Headcount is calculated transparently: Total registered students in the hostel minus students who marked 'Skip' before the cut-off, multiplied by the historical show-up rate for that specific day of the week and meal slot. There is no confusing black-box AI—everything is based on actual mess records."
    },
    {
        "id": "warden-dashboards",
        "role_target": "warden",
        "category": "How-To",
        "title": "Using the Waste & Ratings Dashboards",
        "summary": "Actionable data to oversee caterer quality and waste trends.",
        "content": "The Warden dashboard highlights top-wasted dishes and lowest-rated meals. Use 'Waste per Head' (leftover kg divided by headcount served) to compare busy days with quiet weekends fairly. If a dish is consistently rejected or wasted, use the Action Tracker to record a recipe or supplier change."
    },
    {
        "id": "action-tracker-loop",
        "role_target": "general",
        "category": "Concepts",
        "title": "The 'You Said, We Did' Closed Feedback Loop",
        "summary": "Closing the loop between student complaints and kitchen action.",
        "content": "Feedback only works when students see real change. When the warden logs a correction (e.g. 'Reduced salt in Dal Tadka after student feedback'), it publishes immediately to the public 'You Said, We Did' board, showing students that their ratings genuinely improve their meals."
    },
    {
        "id": "pwa-installation",
        "role_target": "general",
        "category": "Getting Started",
        "title": "Installing MessPulse on your Phone Home Screen",
        "summary": "Install as a lightweight app without needing an app store.",
        "content": "On Android (Chrome): Tap the three dots menu and select 'Add to Home screen' or 'Install App'. On iOS (Safari): Tap the Share button at the bottom and tap 'Add to Home Screen'. MessPulse works seamlessly as an offline-tolerant PWA."
    }
]

@router.get("/articles", response_model=List[HelpArticleResponse])
def get_help_articles(
    role: Optional[str] = Query(None, description="Filter by role target (student, staff, warden, general)"),
    search: Optional[str] = Query(None, description="Search query")
):
    """Returns user guide articles and FAQs with optional role and keyword search filtering."""
    results = HELP_ARTICLES
    if role and role != "all":
        results = [a for a in results if a["role_target"] in (role, "general")]
    if search:
        q = search.lower().strip()
        results = [
            a for a in results
            if q in a["title"].lower() or q in a["summary"].lower() or q in a["content"].lower()
        ]
    return [HelpArticleResponse(**a) for a in results]
