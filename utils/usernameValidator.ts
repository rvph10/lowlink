type ValidationResult = {
  isValid: boolean;
  reason: string | null;
};

// Categories of problematic usernames
const RESERVED_WORDS = [
  "admin",
  "administrator",
  "system",
  "moderator",
  "mod",
  "support",
  "help",
  "official",
  "staff",
  "team",
  "security",
  "verified",
  "lowlink",
  "app",
  "root",
  "null",
  "undefined",
  "404",
  "home",
  "login",
  "signup",
  "signin",
  "register",
  "dashboard",
  "settings",
  "profile",
  "account",
  "user",
  "users",
  "api",
  "search",
  "discover",
  "explore",
  "trending",
  "popular",
  "notifications",
  "messages",
  "inbox",
  "chat",
  "feed",
  "about",
  "terms",
  "privacy",
  "contact",
  "help",
  "faq",
  "password",
  "reset",
  "recover",
  "404",
  "error",

  // Features specific to your app
  "premium",
  "upgrade",
  "subscribe",
  "downloads",
  "upload",
  "files",
  "media",
  "analytics",
  "stats",
  "reports",
];

const COMMON_VULNERABLE_USERNAMES = [
  "test",
  "user",
  "guest",
  "anonymous",
  "username",
  "login",
  "temp",
  "temporary",
  "admin",
  "administrator",
  "moderator",
  "mod",
  "support",
  "help",
  "official",
  "staff",
  "team",
  "security",
  "verified",
  "lowlink",
  "app",
  "root",
  "null",
  "undefined",
  "404",
  "home",
  "login",
  "signup",
  "signin",
];

// Basic list of harmful terms - would be expanded in production
const HARMFUL_WORDS = [
  // Profanity and obscenities
  "fuck",
  "shit",
  "ass",
  "dick",
  "pussy",
  "cock",
  "bitch",
  "cunt",
  "bastard",
  "faggot",
  "fag",
  "whore",
  "slut",
  "piss",
  "tits",
  "twat",
  "asshole",
  "douchebag",
  "motherfucker",
  "bullshit",
  "fuckwit",
  "wanker",
  "dickhead",
  "shithead",
  "cumshot",
  "jizz",
  "butthole",
  "buttfuck",
  "blowjob",
  "handjob",

  // Sexual content
  "porn",
  "pornhub",
  "porntube",
  "pornstar",
  "sex",
  "sexy",
  "onlyfans",
  "nsfw",
  "xxx",
  "adult",
  "milf",
  "anal",
  "bdsm",
  "fetish",
  "hentai",
  "masturbate",
  "orgasm",
  "penis",
  "vagina",
  "dildo",
  "incest",
  "rimjob",

  // Hate speech and discrimination
  "nazi",
  "hitler",
  "kkk",
  "jihad",
  "terrorist",
  "nigga",
  "nigger",
  "kike",
  "chink",
  "spic",
  "beaner",
  "wetback",
  "gook",
  "towelhead",
  "raghead",
  "gypped",
  "jap",
  "paki",
  "redskin",
  "tranny",
  "dyke",
  "retard",
  "retarded",
  "whitesupremacy",
  "blacksupremacy",
  "antisemitic",
  "antisemitism",
  "homophobe",
  "homophobic",
  "transphobe",
  "transphobic",
  "ableist",
  "swastika",
  "blackface",
  "yellowface",

  // Drug and illegal activity related
  "cocaine",
  "heroin",
  "meth",
  "weed",
  "drugs",
  "crack",
  "crackhead",
  "addict",
  "junkie",
  "dope",
  "ecstasy",
  "mdma",
  "lsd",
  "acid",
  "shrooms",
  "cannabis",
  "marijuana",
  "crystal",
  "needles",
  "overdose",
  "narco",
  "cartel",
  "smuggle",
  "smuggler",
  "dealer",

  // Hacking and cybercrime
  "hack",
  "hacker",
  "phishing",
  "ddos",
  "botnet",
  "malware",
  "ransomware",
  "spyware",
  "trojan",
  "keylogger",
  "cracker",
  "exploit",
  "rootkit",
  "virus",
  "worm",
  "bruteforce",
  "backdoor",
  "cybercrime",

  // Violence and extremism
  "kill",
  "murder",
  "rape",
  "bomb",
  "terrorist",
  "shooting",
  "killer",
  "assassin",
  "hitman",
  "sniper",
  "execute",
  "genocide",
  "massacre",
  "slaughter",
  "torture",
  "mutilate",
  "molest",
  "molester",
  "predator",
  "strangle",
  "stab",
  "jihad",
  "suicide",
  "bomber",
  "martyr",
  "extremist",
  "radical",
  "radicalize",
  "weapon",
  "terror",
  "exterminate",

  // Scam and fraud
  "scam",
  "scammer",
  "fraud",
  "fraudster",
  "ponzi",
  "pyramid",
  "launder",
  "counterfeit",
  "phish",
  "fakeid",
  "idtheft",
  "cheat",
  "steal",
  "thief",
  "thieve",
  "con",
  "conman",
  "swindle",
  "embezzle",
  "fakecheck",

  // Self-harm
  "suicide",
  "suicidal",
  "cutting",
  "selfharm",
  "overdose",
  "euthanasia",
  "anorexia",
  "bulimia",
  "purge",

  // Other offensive terms
  "pedo",
  "pedophile",
  "childporn",
  "childabuse",
  "necrophilia",
  "zoophilia",
  "bestiality",
  "scat",
  "necro",
  "zoo",
];

/**
 * Validates a username against various problematic patterns
 */
export function validateUsername(username: string): ValidationResult {
  // Convert to lowercase for case-insensitive matching
  const lowercaseUsername = username.toLowerCase();

  // Check if username contains only allowed characters
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      reason: "Username can only contain letters, numbers, and underscores",
    };
  }

  // Check for minimum length
  if (username.length < 3) {
    return {
      isValid: false,
      reason: "Username must be at least 3 characters long",
    };
  }

  // Check for reserved system words that could be used for impersonation
  if (
    RESERVED_WORDS.some(
      (word) =>
        lowercaseUsername === word ||
        lowercaseUsername.startsWith(word + "_") ||
        lowercaseUsername.endsWith("_" + word) ||
        lowercaseUsername.includes("." + word),
    )
  ) {
    return {
      isValid: false,
      reason: "This username is reserved for system use",
    };
  }

  // Check for common usernames that are likely targets for impersonation
  if (COMMON_VULNERABLE_USERNAMES.some((word) => lowercaseUsername === word)) {
    return {
      isValid: false,
      reason:
        "This username is too generic and could lead to impersonation issues",
    };
  }

  // Check for harmful words
  for (const word of HARMFUL_WORDS) {
    if (
      lowercaseUsername.includes(word) ||
      // Check for common letter/number substitutions (e.g., "a" → "4")
      lowercaseUsername
        .replace(/[04831]/g, (match) => {
          return (
            { "0": "o", "4": "a", "8": "b", "3": "e", "1": "i" }[match] || match
          );
        })
        .includes(word)
    ) {
      return {
        isValid: false,
        reason: "Username contains inappropriate content",
      };
    }
  }

  // Check for repeated special characters that might indicate spam
  if (/(.)\1{4,}/.test(username)) {
    return {
      isValid: false,
      reason: "Username contains too many repeated characters",
    };
  }

  // Add additional checks for patterns that might evade the above checks
  // For example, check for alternating characters that might form inappropriate words
  if (/[a-z]_[a-z]_[a-z]/.test(lowercaseUsername)) {
    const lettersOnly = lowercaseUsername.replace(/_/g, "");
    for (const word of HARMFUL_WORDS) {
      if (lettersOnly.includes(word)) {
        return {
          isValid: false,
          reason: "Username contains inappropriate content",
        };
      }
    }
  }

  // If all checks pass, the username is valid
  return {
    isValid: true,
    reason: null,
  };
}

/**
 * Rates the safety of a username from 0-100
 * Can be used for more granular validation decisions
 */
export function getUsernameSafetyScore(username: string): number {
  let score = 100;
  const lowercaseUsername = username.toLowerCase();

  // Basic character and length penalties
  if (!/^[a-zA-Z0-9_]+$/.test(username)) score -= 25;
  if (username.length < 4) score -= 15;

  // Penalties for similarity to reserved words
  for (const word of RESERVED_WORDS) {
    if (lowercaseUsername === word) {
      score -= 100;
      break;
    } else if (
      lowercaseUsername.startsWith(word) ||
      lowercaseUsername.endsWith(word) ||
      lowercaseUsername.includes("." + word)
    ) {
      score -= 30;
    } else if (lowercaseUsername.includes(word)) {
      score -= 15;
    }
  }

  // Penalties for common vulnerable usernames
  for (const word of COMMON_VULNERABLE_USERNAMES) {
    if (lowercaseUsername === word) {
      score -= 40;
      break;
    }
  }

  // Penalties for harmful words
  for (const word of HARMFUL_WORDS) {
    if (lowercaseUsername.includes(word)) {
      score -= 100;
      break;
    } else {
      // Check for leet speak substitutions
      const leetVersion = lowercaseUsername.replace(/[04831]/g, (match) => {
        return (
          { "0": "o", "4": "a", "8": "b", "3": "e", "1": "i" }[match] || match
        );
      });

      if (leetVersion.includes(word)) {
        score -= 100;
        break;
      }
    }
  }

  // Cap score between 0 and 100
  return Math.max(0, Math.min(100, score));
}
