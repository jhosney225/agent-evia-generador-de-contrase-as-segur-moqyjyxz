
```javascript
const Anthropic = require("@anthropic-ai/sdk");

// Initialize Anthropic client
const client = new Anthropic();

// Core password generation with entropy calculation
function calculateEntropy(passwordLength, characterSetSize) {
  // Entropy = log2(characterSetSize^passwordLength)
  return Math.log2(Math.pow(characterSetSize, passwordLength));
}

function getCharacterSetSize(options) {
  let size = 0;
  if (options.lowercase) size += 26; // a-z
  if (options.uppercase) size += 26; // A-Z
  if (options.numbers) size += 10; // 0-9
  if (options.symbols) size += 32; // Common symbols
  return size;
}

function generatePasswordLocally(options) {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let characters = "";
  if (options.lowercase) characters += lowercase;
  if (options.uppercase) characters += uppercase;
  if (options.numbers) characters += numbers;
  if (options.symbols) characters += symbols;

  if (characters.length === 0) {
    throw new Error("At least one character type must be selected");
  }

  let password = "";
  for (let i = 0; i < options.length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  // Ensure password contains at least one character from each selected type
  const requirements = [];
  if (options.lowercase) requirements.push(lowercase);
  if (options.uppercase) requirements.push(uppercase);
  if (options.numbers) requirements.push(numbers);
  if (options.symbols) requirements.push(symbols);

  // Shuffle password to avoid predictable patterns
  password = password.split("").sort(() => Math.random() - 0.5).join("");

  return password;
}

async function analyzePasswordWithClaude(password, options) {
  // Use Claude to analyze the generated password and provide insights
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analyze the security of this password and provide brief insights:
Password: ${password}
Length: ${password.length}
Character types used: ${Object.entries(options)
          .filter(([k, v]) => k !== "length" && v)
          .map(([k]) => k)
          .join(", ")}

Provide:
1. Security assessment (weak/moderate/strong/very strong)
2. Estimated time to crack (brief)
3. One security tip

Keep response concise (2-3 sentences total).`,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

async function main() {
  console.log("🔐 Secure Password Generator with Entropy Analysis\n");
  console.log("=".repeat(50) + "\n");

  // Define password generation options
  const passwordOptions = [
    {
      name: "Standard (12 chars)",
      config: {
        length: 12,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: false,
      },
    },
    {
      name: "Strong (16 chars)",
      config: {
        length: 16,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
      },
    },
    {
      name: "Ultra Secure (24 chars)",
      config: {
        length: 24,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
      },
    },
  ];

  // Generate and analyze passwords
  for (const option of passwordOptions) {
    console.log(`\n📌 Generating: ${option.name}`);
    console.log("-".repeat(50));

    // Generate the password
    const password = generatePasswordLocally(option.config);
    const characterSetSize = getCharacterSetSize(option.config);
    const entropy = calculateEntropy(option.config.length, characterSetSize);

    console.log(`Password: ${password}`);
    console.log(`Length: ${option.config.length} characters`);
    console.log(`Character set size: ${characterSetSize}`);
    console.log(`Entropy: ${entropy.toFixed(2)} bits`);

    // Provide entropy interpretation
    if (entropy < 32) {
      console.log("Entropy level: ⚠️  Low (weak)");
    } else if (entropy < 64) {
      console.log("Entropy level: ⚠️  Moderate (acceptable for many uses)");
    } else if (entropy < 128) {
      console.log("Entropy level: ✅ Strong (recommended)");
    } else {
      console.log("Entropy level: 🔒 Very Strong (excellent security)");
    }

    // Analyze with Claude
    try {
      console.log("\n🤖 Claude's Security Analysis:");
      const analysis = await analyzePasswordWithClaude(password, option.config);
      console.log(analysis);
    } catch (error) {
      console.log("Note: Claude analysis unavailable");
    }
  }

  // Additional entropy demonstration
  console.log("\n" + "=".repeat(50));
  console.log("\n📊 Entropy Reference Table\n");
  console.log("Password Length | Char Set | Entropy (bits) | Security");
  console.log("-".repeat(60));

  const charSets = [
    {
      size: 26,
      name