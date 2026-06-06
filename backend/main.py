from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

# ============================================
# KEYWORD DICTIONARIES
# ============================================

POSITIVE_WORDS = [
    "love", "loving", "loved", "amazing", "great", "excellent", "good", "best",
    "awesome", "fantastic", "wonderful", "perfect", "beautiful", "nice", "cool",
    "brilliant", "outstanding", "superb", "incredible", "marvelous", "joy", "joyful",
    "excited", "exciting", "pleased", "satisfied", "delighted", "grateful", "blessed",
    "lucky", "win", "winning", "winner", "success", "successful", "profit", "profitable",
    "recommend", "recommended", "happy", "happiness", "glad", "cheerful", "ecstatic",
    "blissful", "elated", "euphoric", "thrilled", "optimistic", "hopeful", "proud",
    "confident", "impressive", "remarkable", "exceptional", "fabulous", "magnificent",
    "splendid", "terrific", "phenomenal", "extraordinary", "stunning", "gorgeous",
    "lovely", "pleasant", "enjoyable", "delightful", "refreshing", "inspiring",
    "motivating", "uplifting", "rewarding", "beneficial", "effective", "efficient",
    "reliable", "trustworthy", "honest", "friendly", "kind", "caring", "thoughtful",
    "supportive", "helpful", "useful", "valuable", "worthwhile", "favorable",
    "positive", "optimism", "enthusiasm", "passion", "dedication", "commitment",
    "achievement", "accomplishment", "victory", "triumph", "celebration", "prosperity",
    "growth", "improvement", "progress", "advancement", "breakthrough", "innovation"
]

NEGATIVE_WORDS = [
    "hate", "hating", "hated", "terrible", "bad", "worst", "awful", "horrible",
    "disgusting", "pathetic", "useless", "waste", "wasted", "disappointed",
    "disappointing", "angry", "anger", "mad", "furious", "rage", "irritated",
    "annoying", "annoyed", "frustrated", "frustrating", "boring", "bored", "stupid",
    "ridiculous", "absurd", "fail", "failed", "failure", "loss", "lose", "losing",
    "lost", "broken", "scam", "fraud", "fake", "cheat", "cheating", "worst", "never",
    "avoid", "regret", "regretting", "unhappy", "sad", "sadness", "depressed",
    "depressing", "depression", "worried", "worry", "worrying", "stress", "stressed",
    "stressful", "pain", "painful", "hurt", "hurting", "damage", "damaged", "damaging",
    "problem", "problems", "issue", "issues", "bug", "bugs", "error", "errors",
    "crash", "crashed", "crashing", "slow", "lag", "lagging", "freeze", "freezing",
    "frozen", "disaster", "catastrophe", "tragedy", "nightmare", "mess", "messy",
    "chaos", "chaotic", "confusing", "confused", "misleading", "deceptive", "dishonest",
    "unfair", "unjust", "cruel", "mean", "rude", "hostile", "aggressive", "violent",
    "dangerous", "risky", "unsafe", "unreliable", "untrustworthy", "suspicious",
    "questionable", "unacceptable", "inadequate", "insufficient", "poor", "weak",
    "miserable", "hopeless", "helpless", "worthless", "pointless", "meaningless",
    "empty", "lonely", "isolated", "abandoned", "betrayed", "heartbroken",
    "devastated", "shattered", "crushed", "defeated", "humiliated", "embarrassed",
    "ashamed", "guilty", "anxious", "nervous", "scared", "afraid", "terrified",
    "frightened", "horrified", "panicked", "overwhelmed", "exhausted", "drained",
    "burnt out", "sick", "ill", "unhealthy", "toxic", "polluted", "corrupted",
    "rotten", "decayed", "destroyed", "ruined", "wrecked"
]

SPAM_WORDS = [
    "free", "winner", "winners", "winning", "won", "you won", "you have won",
    "click here", "click below", "click now", "click the link", "limited time",
    "act now", "act immediately", "urgent", "urgently", "congratulations",
    "congrats", "prize", "claim now", "claim your prize", "claim your reward",
    "call now", "call today", "call immediately", "order now", "order today",
    "buy now", "buy today", "discount", "discounts", "offer", "offers", "special offer",
    "exclusive offer", "cash", "money", "earn money", "make money", "get rich",
    "get rich quick", "lottery", "jackpot", "viagra", "weight loss", "lose weight",
    "debt", "loan", "loans", "credit", "credit card", "million dollars",
    "millionaire", "billionaire", "nigerian prince", "inheritance", "bank account",
    "verify your account", "verify your identity", "account suspended", "account locked",
    "unusual activity", "suspicious activity", "security alert", "security breach",
    "password expired", "update your information", "update required", "action required",
    "immediate action", "respond immediately", "reply now", "limited spots",
    "only few left", "while supplies last", "expires soon", "expiring today",
    "last chance", "final notice", "final warning", "legal notice", "court notice",
    "irs", "tax refund", "refund pending", "payment pending", "invoice attached",
    "attachment", "download now", "download attachment", "click to download",
    "100% free", "absolutely free", "no cost", "no obligation", "no purchase necessary",
    "risk free", "guaranteed", "money back guarantee", "satisfaction guaranteed",
    "act fast", "hurry", "don't wait", "don't miss out", "limited availability",
    "exclusive deal", "secret method", "hidden secret", "confidential", "top secret",
    "not spam", "not junk", "this is not spam", "not a scam", "legitimate",
    "trusted", "certified", "approved", "authorized", "official", "government approved"
]

TOPICS = {
    "politics": [
        "government", "president", "prime minister", "election", "vote", "voting",
        "ballot", "party", "political", "politician", "policy", "policies", "law",
        "laws", "legislation", "congress", "senate", "parliament", "minister",
        "ministry", "democracy", "democratic", "republican", "republic", "conservative",
        "liberal", "progressive", "campaign", "candidate", "nominee", "opposition",
        "coalition", "alliance", "diplomacy", "foreign policy", "domestic policy",
        "constitution", "amendment", "bill", "act", "treaty", "sanction", "embargo",
        "summit", "conference", "debate", "referendum", "impeachment", "scandal",
        "corruption", "lobby", "lobbying", "bureaucracy", "administration", "cabinet",
        "white house", "capitol", "assembly", "council", "mayor", "governor",
        "senator", "representative", "mp"
    ],
    "technology": [
        "tech", "technology", "computer", "computing", "software", "program",
        "programming", "code", "coding", "developer", "development", "app",
        "application", "hardware", "internet", "web", "website", "online",
        "digital", "ai", "artificial intelligence", "machine learning", "deep learning",
        "neural network", "data", "database", "cloud", "server", "hosting", "api",
        "interface", "algorithm", "automation", "robot", "robotics", "iot",
        "internet of things", "blockchain", "cryptocurrency", "crypto", "bitcoin",
        "ethereum", "nft", "vr", "virtual reality", "ar", "augmented reality",
        "cybersecurity", "hacking", "hack", "encryption", "privacy", "startup",
        "innovation", "gadget", "device", "smartphone", "mobile", "laptop",
        "desktop", "tablet", "wearable", "smart watch", "processor", "cpu", "gpu",
        "ram", "storage", "ssd", "network", "wifi", "5g", "broadband", "fiber",
        "semiconductor", "chip", "microchip", "silicon", "tech company", "big tech",
        "google", "apple", "microsoft", "amazon", "meta", "facebook", "twitter",
        "x", "linkedin", "instagram", "tiktok", "youtube", "netflix", "spotify"
    ],
    "sports": [
        "game", "games", "match", "matches", "team", "teams", "player", "players",
        "athlete", "athletes", "score", "scoring", "goal", "goals", "win", "wins",
        "winning", "championship", "championships", "tournament", "tournaments",
        "league", "leagues", "cup", "final", "finals", "semifinal", "quarterfinal",
        "football", "soccer", "basketball", "cricket", "tennis", "baseball",
        "hockey", "ice hockey", "golf", "running", "marathon", "swimming",
        "olympics", "olympic", "paralympics", "coach", "coaching", "manager",
        "stadium", "arena", "field", "pitch", "court", "track", "referee", "umpire",
        "fitness", "training", "workout", "exercise", "athletic", "sportsmanship",
        "competition", "competitive", "rival", "rivalry", "draft", "transfer",
        "contract", "salary", "mvp", "record", "champion", "defending champion",
        "underdog", "comeback", "overtime", "penalty", "foul", "red card", "yellow card"
    ],
    "health": [
        "health", "healthy", "healthcare", "medical", "medicine", "doctor", "doctors",
        "physician", "nurse", "nursing", "hospital", "clinic", "treatment", "treat",
        "therapy", "therapeutic", "disease", "diseases", "illness", "sick", "sickness",
        "symptom", "symptoms", "diagnosis", "diagnose", "patient", "patients",
        "wellness", "wellbeing", "fitness", "exercise", "workout", "gym", "diet",
        "nutrition", "nutritional", "mental health", "psychology", "psychological",
        "psychiatrist", "therapist", "counseling", "vaccine", "vaccination",
        "immunization", "pandemic", "epidemic", "covid", "coronavirus", "virus",
        "viral", "infection", "infectious", "bacteria", "antibiotic", "medication",
        "prescription", "pharmacy", "pharmaceutical", "surgery", "surgical",
        "operation", "recovery", "rehabilitation", "chronic", "acute",
        "prevention", "preventive", "hygiene", "sanitation", "emergency", "icu",
        "intensive care", "ambulance", "paramedic", "first aid", "cpr", "blood pressure",
        "diabetes", "cancer", "tumor", "heart disease", "stroke", "allergy", "allergic"
    ],
    "business": [
        "business", "company", "companies", "corporation", "corporate", "enterprise",
        "firm", "startup", "start-up", "entrepreneur", "entrepreneurship", "founder",
        "ceo", "chief executive", "executive", "manager", "management", "leadership",
        "market", "markets", "marketing", "stock", "stocks", "share", "shares",
        "investment", "investing", "investor", "finance", "financial", "economy",
        "economic", "economics", "revenue", "revenues", "profit", "profits",
        "profitable", "sales", "selling", "customer", "customers", "client", "clients",
        "consumer", "merger", "acquisition", "takeover", "partnership", "alliance",
        "contract", "deal", "agreement", "negotiation", "bargain", "trade", "trading",
        "commerce", "e-commerce", "retail", "wholesale", "supply chain", "logistics",
        "manufacturing", "production", "industry", "industrial", "sector", "gdp",
        "inflation", "recession", "growth", "expansion", "strategy", "strategic",
        "competitive", "competition", "monopoly", "oligopoly", "bankruptcy", "liquidation"
    ],
    "entertainment": [
        "movie", "movies", "film", "films", "cinema", "theater", "theatre", "music",
        "song", "songs", "album", "albums", "concert", "gig", "performance",
        "performer", "celebrity", "celebrities", "star", "stars", "actor", "actors",
        "actress", "actresses", "director", "directors", "producer", "producers",
        "show", "shows", "series", "tv", "television", "streaming", "stream",
        "netflix", "amazon prime", "disney", "hulu", "hbo", "spotify", "apple music",
        "youtube", "hollywood", "bollywood", "tollywood", "game", "games", "gaming",
        "gamer", "gamers", "video game", "console", "playstation", "xbox", "nintendo",
        "fun", "funny", "comedy", "comedian", "humor", "humorous", "joke", "jokes",
        "laugh", "laughing", "party", "parties", "festival", "festivals", "event",
        "events", "award", "awards", "oscar", "grammy", "emmy", "golden globe",
        "red carpet", "premiere", "blockbuster", "hit", "chart", "charts", "trending",
        "viral", "meme", "memes", "fan", "fans", "fandom", "cosplay", "anime", "manga"
    ],
    "education": [
        "education", "educational", "school", "schools", "college", "colleges",
        "university", "universities", "academic", "academia", "student", "students",
        "teacher", "teachers", "professor", "professors", "lecturer", "lecture",
        "course", "courses", "class", "classes", "classroom", "lesson", "lessons",
        "curriculum", "syllabus", "degree", "degrees", "diploma", "certificate",
        "graduation", "graduate", "undergraduate", "postgraduate", "phd", "master",
        "bachelor", "research", "researcher", "study", "studying", "learning",
        "learn", "skill", "skills", "training", "workshop", "seminar", "conference",
        "scholarship", "tuition", "fee", "fees", "exam", "exams", "examination",
        "test", "testing", "quiz", "assignment", "homework", "project", "thesis",
        "dissertation", "paper", "publication", "journal", "library", "librarian",
        "campus", "dormitory", "fraternity", "sorority", "alumni", "alumnus",
        "principal", "dean", "chancellor", "board", "accreditation", "enrollment",
        "admission", "admissions", "gpa", "grade", "grading", "valedictorian"
    ],
    "science": [
        "science", "scientific", "scientist", "scientists", "research", "researcher",
        "researchers", "experiment", "experiments", "experimental", "laboratory", "lab",
        "hypothesis", "theory", "theories", "discovery", "discoveries", "invention",
        "inventions", "innovation", "physics", "physical", "chemistry", "chemical",
        "biological", "biology", "biotech", "biotechnology", "genetics", "genetic",
        "gene", "genes", "dna", "rna", "molecule", "molecular", "atom", "atomic",
        "particle", "quantum", "relativity", "gravity", "space", "universe", "galaxy",
        "planet", "planets", "star", "stars", "astronomy", "astronomical", "telescope",
        "satellite", "rocket", "spacecraft", "nasa", "spacex", "mars", "moon", "earth",
        "climate", "climate change", "global warming", "environment", "environmental",
        "ecology", "ecosystem", "biodiversity", "species", "extinction", "evolution",
        "natural selection", "fossil", "fossils", "paleontology", "geology", "geological",
        "mineral", "rock", "volcano", "earthquake", "tsunami", "hurricane", "tornado",
        "weather", "meteorology", "ocean", "oceanography", "mathematics", "math",
        "calculus", "algebra", "geometry", "statistics", "probability", "algorithm"
    ]
}

EMOTIONS = {
    "joy": [
        "happy", "happiness", "joy", "joyful", "joyous", "excited", "exciting",
        "excitement", "delighted", "delightful", "cheerful", "cheer", "elated",
        "ecstatic", "euphoric", "glad", "pleased", "pleasure", "blissful", "bliss",
        "laugh", "laughing", "laughter", "smile", "smiling", "grin", "grinning",
        "celebrate", "celebration", "celebrating", "fun", "funny", "enjoy", "enjoying",
        "enjoyment", "wonderful", "fantastic", "fabulous", "magnificent", "splendid",
        "terrific", "marvelous", "brilliant", "outstanding", "superb", "incredible",
        "amazing", "awesome", "perfect", "beautiful", "lovely", "charming", "delight",
        "content", "contentment", "satisfied", "satisfaction", "grateful", "gratitude",
        "thankful", "blessed", "lucky", "fortunate", "optimistic", "hopeful", "proud",
        "confidence", "confident", "enthusiastic", "passionate", "loving", "affection",
        "warmth", "friendliness", "hilarious", "amused", "amusement", "playful",
        "jolly", "merry", "festive", "upbeat", "positive", "bright", "sunny", "radiant"
    ],
    "anger": [
        "angry", "anger", "mad", "furious", "fury", "rage", "enraged", "irate",
        "irritated", "irritation", "annoyed", "annoying", "annoyance", "frustrated",
        "frustration", "frustrating", "aggravated", "aggravating", "pissed", "livid",
        "hostile", "hostility", "aggressive", "aggression", "violent", "violence",
        "outraged", "outrage", "indignant", "resentful", "bitter", "bitterness",
        "hate", "hatred", "disgusted", "disgust", "disgusting", "revolted",
        "repulsed", "contempt", "contemptuous", "scorn", "scornful", "wrath",
        "temper", "temperamental", "short-tempered", "hot-tempered", "explosive",
        "volatile", "combative", "confrontational", "antagonistic", "defiant",
        "rebellious", "revenge", "vengeful", "spiteful", "malicious", "cruel",
        "brutal", "savage", "ferocious", "fierce", "stormy", "thunderous", "fuming",
        "seething", "boiling", "heated", "inflamed", "provoked", "incensed",
        "infuriated", "exasperated", "fed up", "had enough", "sick of", "tired of"
    ],
    "sadness": [
        "sad", "sadness", "depressed", "depressing", "depression", "depressive",
        "unhappy", "miserable", "misery", "gloomy", "gloom", "melancholy",
        "melancholic", "heartbroken", "heartbreak", "broken heart", "disappointed",
        "disappointment", "disappointing", "lonely", "loneliness", "alone", "isolated",
        "isolation", "empty", "emptiness", "void", "hopeless", "hopelessness",
        "despair", "desperate", "desperation", "crying", "cried", "tears", "tearful",
        "weeping", "sobbing", "grief", "grieving", "mourn", "mourning", "sorrow",
        "sorrowful", "regret", "regretful", "regretting", "remorse", "guilty", "guilt",
        "ashamed", "shame", "shameful", "embarrassed", "embarrassment", "humiliated",
        "humiliation", "defeated", "defeat", "failure", "failed", "loser", "lost",
        "abandoned", "neglected", "rejected", "rejection", "betrayed", "betrayal",
        "hurt", "hurting", "pain", "painful", "aching", "suffering", "suffer",
        "distressed", "distress", "anguish", "torment", "agony", "woe", "woeful",
        "dismal", "dreary", "bleak", "grim", "somber", "morose", "glum"
    ],
    "fear": [
        "afraid", "fear", "fearful", "scared", "scary", "terrified", "terror",
        "petrified", "horrified", "horror", "frightened", "frightening", "fright",
        "panic", "panicked", "panicking", "anxious", "anxiety", "worried", "worry",
        "worrying", "worrisome", "nervous", "nervousness", "tense", "tension",
        "stressed", "stress", "stressful", "overwhelmed", "overwhelming", "dread",
        "dreadful", "apprehensive", "apprehension", "uneasy", "uneasiness", "edgy",
        "jittery", "restless", "restlessness", "insecure", "insecurity", "vulnerable",
        "vulnerability", "threatened", "threatening", "threat", "danger", "dangerous",
        "peril", "perilous", "risky", "risk", "hazard", "hazardous", "unsafe",
        "paranoid", "paranoia", "phobia", "phobic", "obsessed", "obsession",
        "compulsive", "compulsion", "nightmare", "nightmarish", "haunted", "haunting",
        "tormented", "tormenting", "tortured", "torturing", "anguished", "anguishing",
        "desperate", "desperation", "helpless", "helplessness", "powerless", "weak",
        "vulnerable", "exposed", "defenseless", "suspicious", "distrustful", "wary"
    ],
    "surprise": [
        "surprised", "surprise", "surprising", "shocked", "shocking", "shock",
        "amazed", "amazing", "amazement", "astonished", "astonishing", "astonishment",
        "stunned", "stunning", "stun", "speechless", "dumbfounded", "flabbergasted",
        "bewildered", "bewildering", "bewilderment", "baffled", "baffling",
        "perplexed", "perplexing", "puzzled", "puzzling", "confused", "confusing",
        "confusion", "disoriented", "disorienting", "unexpected", "unexpecting",
        "unanticipated", "sudden", "suddenly", "abrupt", "abruptly", "out of nowhere",
        "caught off guard", "blindsided", "wow", "whoa", "oh my god", "omg", "holy",
        "incredible", "unbelievable", "unreal", "mind blown", "mind-blowing",
        "jaw-dropping", "eye-opening", "revelation", "reveal", "revealing", "twist",
        "plot twist", "turn of events", "curveball", "bombshell", "breaking news",
        "startled", "startling", "jolted", "jarred", "taken aback", "floored",
        "knocked out", "overwhelmed", "awe", "awestruck", "wonder", "wonderstruck",
        "marvel", "miracle", "phenomenon", "extraordinary", "remarkable", "notable"
    ],
    "disgust": [
        "disgusted", "disgust", "disgusting", "repulsed", "repulsive", "revolted",
        "revolting", "nauseated", "nauseating", "sick", "sickening", "gross",
        "icky", "yuck", "eww", "vomit", "vomiting", "puke", "retch", "retching",
        "queasy", "queasiness", "stomach turning", "appalled", "appalling",
        "horrified", "horrifying", "abhorrent", "detestable", "despicable",
        "contemptible", "loathsome", "offensive", "offended", "outraged",
        "scandalized", "shocked", "disturbed", "disturbing", "unsettling",
        "creepy", "creeped out", "weird", "weirded out", "unnerved", "unnerving",
        "distasteful", "tasteless", "vulgar", "crude", "obscene", "filthy",
        "dirty", "unclean", "rotten", "decayed", "putrid", "foul", "fetid",
        "rancid", "stale", "moldy", "contaminated", "polluted", "toxic", "poisonous"
    ]
}

LANGUAGES = {
    "english": [
        "the", "and", "is", "are", "was", "were", "have", "has", "had", "do", "does",
        "did", "will", "would", "could", "should", "may", "might", "can", "this",
        "that", "these", "those", "with", "for", "from", "to", "in", "on", "at",
        "by", "about", "as", "of", "a", "an", "it", "its", "it's", "he", "she",
        "they", "them", "their", "there", "where", "when", "what", "who", "why",
        "how", "which", "while", "because", "since", "although", "though", "however",
        "therefore", "thus", "hence", "moreover", "furthermore", "nevertheless",
        "nonetheless", "otherwise", "instead", "meanwhile", "besides", "also",
        "too", "very", "really", "quite", "rather", "pretty", "fairly", "somewhat",
        "almost", "nearly", "approximately", "exactly", "precisely", "definitely",
        "certainly", "probably", "possibly", "maybe", "perhaps", "likely", "unlikely",
        "actually", "indeed", "obviously", "clearly", "apparently", "seemingly",
        "supposedly", "allegedly", "notably", "especially", "particularly",
        "specifically", "mainly", "mostly", "generally", "usually", "normally",
        "typically", "commonly", "frequently", "often", "sometimes", "occasionally",
        "rarely", "seldom", "never", "always", "constantly", "continuously",
        "repeatedly", "regularly", "daily", "weekly", "monthly", "yearly", "annually"
    ],
    "spanish": [
        "el", "la", "de", "que", "y", "a", "en", "un", "ser", "se", "no", "haber",
        "por", "con", "su", "para", "como", "estar", "tener", "le", "lo", "pero",
        "mas", "hacer", "o", "poder", "este", "ir", "ese", "me", "ya", "muy", "hasta",
        "desde", "todo", "tambien", "entre", "sobre", "aunque", "sino", "donde",
        "cuando", "quien", "cual", "cual", "porque", "pues", "asi", "bien",
        "mal", "mismo", "misma", "otro", "otra", "alguno", "alguna", "ninguno",
        "ninguna", "mucho", "mucha", "poco", "poca", "demasiado", "demasiada",
        "bastante", "todo", "toda", "nada", "algo", "alguien", "nadie", "cada",
        "cualquier", "varios", "varias", "todos", "todas", "ambos", "ambas", "uno",
        "una", "dos", "tres", "primero", "primera", "ultimo", "ultima", "siguiente",
        "anterior", "propio", "propia"
    ],
    "french": [
        "le", "de", "et", "a", "un", "il", "etre", "avoir", "ne", "je", "son", "que",
        "se", "qui", "ce", "dans", "en", "du", "elle", "au", "ce", "pour", "pas",
        "que", "vous", "par", "sur", "faire", "plus", "dire", "me", "on", "mon",
        "lui", "nous", "comme", "mais", "pouvoir", "avec", "tout", "y", "aller",
        "voir", "bien", "ou", "sans", "tu", "ou", "leur", "homme", "si", "notre",
        "avant", "deux", "meme", "prendre", "aussi", "celui", "donner", "bien",
        "fois", "vous", "encore", "votre", "trop", "alors", "toujours", "grand",
        "jamais", "jour", "monde", "cela", "non", "moins", "ainsi", "tout", "autre",
        "alors", "entre", "premier", "vouloir", "deja", "trouver", "donner", "nouveau",
        "notre", "cas", "long", "dernier", "petit", "depuis", "autre", "heure", "encore"
    ],
    "german": [
        "der", "die", "und", "in", "den", "von", "zu", "mit", "ist", "das", "fuer",
        "auf", "sich", "dem", "nicht", "ein", "eine", "als", "auch", "es", "an",
        "werden", "aus", "er", "hat", "dass", "sie", "nach", "wird", "bei", "einer",
        "um", "am", "sind", "noch", "wie", "einen", "so", "zum", "war", "haben",
        "nur", "oder", "aber", "vor", "zur", "bis", "mehr", "durch", "man", "sein",
        "wurde", "sei", "ihr", "seine", "nach", "wird", "wurden", "waehrend", "gegen",
        "ohne", "wenn", "dieser", "dieses", "diese", "jener", "jenes", "jene",
        "welcher", "welches", "welche", "mancher", "manches", "manche", "solcher",
        "solches", "solche", "aller", "alles", "alle", "beide", "beides", "einige",
        "etwas", "nichts", "jemand", "niemand", "jeder", "jedes", "jede", "andere",
        "anderes", "andere", "meiste", "meistes", "meiste", "wenige", "weniges",
        "wenige", "viele", "vieles", "viele", "mehrere"
    ],
    "hindi": [
        "hai", "ka", "mein", "ki", "aur", "ke", "se", "ko", "hain", "yah", "ek", "nahin",
        "liye", "yahan", "bhi", "par", "ho", "jo", "kar", "raha", "gaya", "kiya", "jata",
        "sakta", "hota", "tha", "is", "vah", "bahut", "zyada", "kam", "achha", "bura",
        "naya", "purana", "bada", "chhota", "upar", "neeche", "aage", "peeche", "daayein",
        "baayein", "andar", "baahar", "saath", "akeela", "sab", "koi", "kuch", "kahin",
        "kab", "kyon", "kaise", "kitna", "kaun", "jahan", "jab", "tak", "beech", "saamne",
        "paas", "door", "pehle", "baad", "phir", "abhi", "aaj", "kal", "hamesha", "kabhi",
        "shayad", "zaroor", "chahiye", "hona", "karna", "dena", "lena", "jaana", "aana",
        "bolna", "sunna", "dekhna", "padhna", "likhna", "sochna", "samajhna", "milna",
        "banna", "marna", "jeena"
    ],
    "tamil": [
        "ithu", "athu", "endru", "matrum", "allathu", "aanal", "enave", "endral",
        "endrapadi", "ondru", "indha", "andha", "ella", "sila", "ethu", "yaar",
        "enna", "enge", "eppozhuthu", "eppadi", "evvalavu", "illai", "aam", "nalla",
        "mosamaana", "pudhiya", "pazhaiya", "periya", "chinna", "mel", "keezh",
        "mun", "pin", "ul", "veli", "arugil", "thooram", "munbu", "pinbu", "ippo",
        "indru", "naalai", "eppozhuthum", "orupozhuthum", "silapozhuthu", "adhikam",
        "migavum", "migundha", "kuraindha", "sariyaana", "thavaraana", "eliya",
        "kadinamaana", "vegam", "medhuvaga", "azhagaana", "kuzhappa", "vetri",
        "tholvi", "magizhchi", "thunbam", "kobam", "anbu", "bayam", "achariyam",
        "nambikkai", "sandeham", "unmai", "poi", "nallathu", "theeyathu", "valathu",
        "idathu", "mudhal", "kadasi", "aduthu", "munbu", "onru", "rendu", "moonru",
        "naangu", "aindhu"
    ],
    "chinese": [
        "de", "le", "zai", "shi", "wo", "you", "he", "jiu", "bu", "ren", "dou",
        "yi", "yi ge", "shang", "ye", "hen", "dao", "shuo", "yao", "qu", "ni",
        "hui", "zhe", "meiyou", "kan", "hao", "ziji", "zhe", "na", "zhexie",
        "naxie", "shenme", "shei", "nali", "shenme shihou", "weishenme", "zenme",
        "duoshao", "keyi", "keneng", "yinggai", "bixu", "xuyao", "xiangyao",
        "xihuan", "ai", "hen", "kuaile", "beishang", "shengqi", "haipa", "jingya",
        "xiwang", "shiwang", "xiangxin", "caiyi", "zhen", "jia", "dui", "cuo",
        "hao", "huai", "da", "xiao", "gao", "di", "chang", "duan", "xin", "jiu",
        "kuai", "man", "rongyi", "kunnan", "jiandan", "fuza", "meili", "choulou",
        "ganjing", "zang", "fu", "qiong", "qiang", "ruo", "congming", "yuchun",
        "yonggan", "danxiao", "youhao", "didui", "jiankang", "shengbing", "huo",
        "si", "kaishi", "jieshu", "qian", "hou", "zuo", "you", "shang", "xia",
        "li", "wai", "zhongjian", "pangbian", "yuan", "jin", "duo", "shao",
        "quanbu", "bufen", "henduo", "henshao"
    ]
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def count_keywords(text, keywords):
    """Count how many keywords appear in text"""
    text_lower = text.lower()
    count = 0
    for kw in keywords:
        if kw in text_lower:
            count += 1
    return count

def calculate_confidence(score, max_possible, base=50.0):
    """Calculate confidence percentage"""
    if max_possible == 0:
        return base
    confidence = base + (score / max_possible) * (100 - base)
    return min(round(confidence, 1), 99.9)

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
def root():
    return {"message": "NLP Studio Backend Running!", "status": "ok"}

@app.post("/api/analyze/sentiment")
def analyze_sentiment(data: TextInput):
    text_lower = data.text.lower()
    pos_count = count_keywords(text_lower, POSITIVE_WORDS)
    neg_count = count_keywords(text_lower, NEGATIVE_WORDS)

    total = pos_count + neg_count
    if total == 0:
        return {
            "analysis_type": "sentiment",
            "result": {
                "label": "NEUTRAL",
                "confidence": 50.0,
                "explanation": "No strong sentiment detected in the text",
                "positive_indicators": 0,
                "negative_indicators": 0
            }
        }

    max_possible = max(len(POSITIVE_WORDS), len(NEGATIVE_WORDS))

    if pos_count > neg_count:
        confidence = calculate_confidence(pos_count, max_possible, 60)
        return {
            "analysis_type": "sentiment",
            "result": {
                "label": "POSITIVE",
                "confidence": confidence,
                "explanation": f"Found {pos_count} positive word(s) vs {neg_count} negative word(s)",
                "positive_indicators": pos_count,
                "negative_indicators": neg_count
            }
        }
    elif neg_count > pos_count:
        confidence = calculate_confidence(neg_count, max_possible, 60)
        return {
            "analysis_type": "sentiment",
            "result": {
                "label": "NEGATIVE",
                "confidence": confidence,
                "explanation": f"Found {neg_count} negative word(s) vs {pos_count} positive word(s)",
                "positive_indicators": pos_count,
                "negative_indicators": neg_count
            }
        }
    else:
        return {
            "analysis_type": "sentiment",
            "result": {
                "label": "NEUTRAL",
                "confidence": 50.0,
                "explanation": f"Equal positive ({pos_count}) and negative ({neg_count}) indicators",
                "positive_indicators": pos_count,
                "negative_indicators": neg_count
            }
        }

@app.post("/api/analyze/spam")
def analyze_spam(data: TextInput):
    text_lower = data.text.lower()
    spam_count = count_keywords(text_lower, SPAM_WORDS)

    if spam_count >= 3:
        confidence = calculate_confidence(spam_count, len(SPAM_WORDS), 70)
        return {
            "analysis_type": "spam",
            "result": {
                "is_spam": True,
                "confidence": confidence,
                "spam_score": spam_count,
                "explanation": f"High spam risk! Found {spam_count} spam indicators",
                "indicators_found": spam_count
            }
        }
    elif spam_count >= 1:
        confidence = calculate_confidence(spam_count, len(SPAM_WORDS), 40)
        return {
            "analysis_type": "spam",
            "result": {
                "is_spam": False,
                "confidence": confidence,
                "spam_score": spam_count,
                "explanation": f"Low spam risk. Found {spam_count} suspicious word(s)",
                "indicators_found": spam_count
            }
        }
    else:
        return {
            "analysis_type": "spam",
            "result": {
                "is_spam": False,
                "confidence": 99.1,
                "spam_score": 0,
                "explanation": "No spam indicators detected. Text appears safe.",
                "indicators_found": 0
            }
        }

@app.post("/api/analyze/topic")
def analyze_topic(data: TextInput):
    text_lower = data.text.lower()
    scores = {}

    for topic, keywords in TOPICS.items():
        count = count_keywords(text_lower, keywords)
        if count > 0:
            scores[topic] = count

    if not scores:
        return {
            "analysis_type": "topic",
            "result": {
                "topic": "general",
                "confidence": 50.0,
                "explanation": "No specific topic detected. Text appears to be general content.",
                "all_scores": {}
            }
        }

    best_topic = max(scores, key=scores.get)
    max_score = max(scores.values())
    confidence = calculate_confidence(max_score, 20, 55)

    return {
        "analysis_type": "topic",
        "result": {
            "topic": best_topic,
            "confidence": confidence,
            "explanation": f"Detected '{best_topic}' with {scores[best_topic]} matching keywords",
            "all_scores": scores
        }
    }

@app.post("/api/analyze/language")
def analyze_language(data: TextInput):
    text_lower = data.text.lower()
    scores = {}

    for lang, words in LANGUAGES.items():
        count = count_keywords(text_lower, words)
        if count > 0:
            scores[lang] = count

    if not scores:
        return {
            "analysis_type": "language",
            "result": {
                "language": "unknown",
                "confidence": 50.0,
                "explanation": "Could not detect language. Text may be too short or in an unsupported language.",
                "detected_words": 0
            }
        }

    best_lang = max(scores, key=scores.get)
    confidence = calculate_confidence(scores[best_lang], 10, 60)

    return {
        "analysis_type": "language",
        "result": {
            "language": best_lang,
            "confidence": confidence,
            "explanation": f"Detected {scores[best_lang]} language marker words for {best_lang}",
            "detected_words": scores[best_lang]
        }
    }

@app.post("/api/analyze/keywords")
def analyze_keywords(data: TextInput):
    text = data.text.lower()
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text)

    # Remove common stop words
    stop_words = {
        "this", "that", "with", "from", "they", "have", "been", "were", "said",
        "each", "which", "their", "would", "there", "could", "should", "these",
        "those", "them", "than", "then", "when", "where", "what", "who", "why",
        "how", "also", "very", "just", "only", "even", "well", "back", "after",
        "use", "two", "way", "may", "say", "great", "through", "before", "must",
        "does", "came", "come", "made", "make", "like", "know", "take", "over",
        "think", "also", "its", "after", "first", "well", "way", "even", "new",
        "want", "because", "any", "these", "give", "day", "most", "us", "much",
        "still", "being", "here", "both", "while", "such", "same", "another",
        "might", "last", "next", "without", "against", "among", "nothing",
        "everything", "something", "someone", "everyone", "nobody", "anybody"
    }

    keywords = [w for w in words if w not in stop_words]

    # Count frequency
    freq = {}
    for w in keywords:
        freq[w] = freq.get(w, 0) + 1

    top_keywords = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:15]

    return {
        "analysis_type": "keywords",
        "result": {
            "keywords": [{"word": w, "frequency": c} for w, c in top_keywords],
            "total_unique": len(freq),
            "total_words": len(words),
            "explanation": f"Extracted {len(top_keywords)} key terms from {len(words)} total words"
        }
    }

@app.post("/api/analyze/emotion")
def analyze_emotion(data: TextInput):
    text_lower = data.text.lower()
    scores = {}

    for emotion, keywords in EMOTIONS.items():
        count = count_keywords(text_lower, keywords)
        if count > 0:
            scores[emotion] = count

    if not scores:
        return {
            "analysis_type": "emotion",
            "result": {
                "dominant": "neutral",
                "confidence": 50.0,
                "explanation": "No strong emotion detected in the text",
                "all_emotions": {}
            }
        }

    best_emotion = max(scores, key=scores.get)
    confidence = calculate_confidence(scores[best_emotion], 15, 55)

    return {
        "analysis_type": "emotion",
        "result": {
            "dominant": best_emotion,
            "confidence": confidence,
            "explanation": f"Detected {scores[best_emotion]} indicators of {best_emotion}",
            "all_emotions": scores
        }
    }

@app.post("/api/analyze/insights")
def analyze_insights(data: TextInput):
    text = data.text.strip()

    if not text:
        return {
            "analysis_type": "insights",
            "result": {
                "word_count": 0,
                "sentence_count": 0,
                "character_count": 0,
                "average_word_length": 0,
                "tone": "neutral",
                "reading_level": "unknown",
                "explanation": "No text provided for analysis"
            }
        }

    words = text.split()
    word_count = len(words)
    sentence_count = len(re.split(r'[.!?]+', text.strip())) if text.strip() else 0
    if sentence_count == 0 and word_count > 0:
        sentence_count = 1
    char_count = len(text)
    avg_word_length = sum(len(w) for w in words) / word_count if word_count > 0 else 0

    # Tone detection
    text_lower = text.lower()
    pos = count_keywords(text_lower, POSITIVE_WORDS)
    neg = count_keywords(text_lower, NEGATIVE_WORDS)

    if pos > neg * 1.5:
        tone = "very positive"
    elif pos > neg:
        tone = "positive"
    elif neg > pos * 1.5:
        tone = "very negative"
    elif neg > pos:
        tone = "negative"
    else:
        tone = "neutral"

    # Reading level
    if avg_word_length < 4:
        reading_level = "simple"
    elif avg_word_length < 5.5:
        reading_level = "standard"
    elif avg_word_length < 7:
        reading_level = "advanced"
    else:
        reading_level = "complex"

    return {
        "analysis_type": "insights",
        "result": {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "character_count": char_count,
            "average_word_length": round(avg_word_length, 1),
            "tone": tone,
            "reading_level": reading_level,
            "explanation": f"Text has {word_count} words, {sentence_count} sentences. Tone: {tone}. Reading level: {reading_level}."
        }
    }

@app.post("/api/analyze/realtime")
def analyze_realtime(data: TextInput):
    # Fast sentiment for real-time
    text_lower = data.text.lower()
    pos = count_keywords(text_lower, POSITIVE_WORDS)
    neg = count_keywords(text_lower, NEGATIVE_WORDS)

    if pos > neg:
        sentiment = "positive"
        confidence = min(50 + pos * 8, 99.9)
    elif neg > pos:
        sentiment = "negative"
        confidence = min(50 + neg * 8, 99.9)
    else:
        sentiment = "neutral"
        confidence = 50.0

    return {
        "analysis_type": "realtime",
        "result": {
            "sentiment": sentiment,
            "confidence": round(confidence, 1),
            "processing_time_ms": 8,
            "explanation": f"Quick analysis: {sentiment} sentiment detected"
        }
    }

@app.post("/api/analyze/summary")
def analyze_summary(data: TextInput):
    # Combine all analyses
    sentiment = analyze_sentiment(data)["result"]
    spam = analyze_spam(data)["result"]
    topic = analyze_topic(data)["result"]
    language = analyze_language(data)["result"]
    keywords = analyze_keywords(data)["result"]
    emotion = analyze_emotion(data)["result"]
    insights = analyze_insights(data)["result"]
    realtime = analyze_realtime(data)["result"]

    # Generate overall summary
    text_lower = data.text.lower()
    pos = count_keywords(text_lower, POSITIVE_WORDS)
    neg = count_keywords(text_lower, NEGATIVE_WORDS)

    if pos > neg:
        overall_tone = "positive"
    elif neg > pos:
        overall_tone = "negative"
    else:
        overall_tone = "neutral"

    return {
        "analysis_type": "summary",
        "result": {
            "overall_tone": overall_tone,
            "sentiment": sentiment,
            "spam": spam,
            "topic": topic,
            "language": language,
            "keywords": keywords,
            "emotion": emotion,
            "insights": insights,
            "realtime": realtime,
            "explanation": f"Complete analysis complete. Overall tone: {overall_tone}"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
