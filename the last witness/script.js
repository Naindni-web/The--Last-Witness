// ======================================================
// THE LAST WITNESS
// Frontend Prototype
// ======================================================


// ================= GAME STATE =================

const gameState = {

    currentSuspect: null,

    evidence: [],

    conversations: [],

    interrogatedsuspects: [],

    questioncount: 0,
    
    suspects: {

        mira: {
            name: "MIRA",
            role: "THE MAID",
            avatar: "M",

            trust: 50,
            suspicion: 10,

            initial:
                "You wanted to speak with me? I... I don't know what else I can tell you.",

            secret:
                "Mira saw someone near the east wing.",

            responses: {
                kitchen:
                    "I was in the kitchen. I stayed there almost the entire night.",

                varen:
                    "Lord Varen was... difficult. But I had no reason to hurt him.",

                east:
                    "The east wing? No. I never went there that night.",

                default:
                    "I don't understand what you're suggesting. I have already told you everything I know."
            }
        },


        kael: {
            name: "KAEL",
            role: "THE GUARD",
            avatar: "K",

            trust: 50,
            suspicion: 10,

            initial:
                "Ask your questions. I have nothing to hide.",

            secret:
                "Kael abandoned his post shortly before the murder.",

            responses: {
                kitchen:
                    "I was guarding the main hall. That was my assignment.",

                varen:
                    "The Lord was alive when I last saw him.",

                east:
                    "I had no business in the east wing.",

                default:
                    "You're wasting time. Find actual evidence before accusing me."
            }
        },


        eron: {
            name: "ERON",
            role: "THE MERCHANT",
            avatar: "E",

            trust: 50,
            suspicion: 10,

            initial:
                "A murder investigation? How unfortunate. I hope I can be of assistance.",

            secret:
                "Eron had a financial dispute with Lord Varen.",

            responses: {
                kitchen:
                    "I was preparing to leave the estate around eleven.",

                varen:
                    "Lord Varen and I had business disagreements. Nothing more.",

                east:
                    "I certainly wasn't wandering around the east wing."

                ,
                default:
                    "Interesting question. But I'm afraid I don't see how that relates to the murder."
            }
        }
    }
};


// ================= SCREEN SYSTEM =================

function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}


// ================= START GAME =================

function startGame() {

    showScreen("caseScreen");

}


// ================= INVESTIGATION =================

function showInvestigation() {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
        screen.style.display = "none";
    });

    const investigation = document.getElementById("investigationScreen");

    if (investigation) {
        investigation.classList.add("active");
        investigation.style.display = "block";
    }
}


// ================= SELECT SUSPECT =================

function selectSuspect(id) {

    const suspect = gameState.suspects[id];

    gameState.currentSuspect = id;

    // Mark this suspect as interrogated
    if (!gameState.interrogatedSuspects.includes(id)) {
        gameState.interrogatedSuspects.push(id);
    }

    document.getElementById("suspectHeader").textContent =
        suspect.name;

    document.getElementById("suspectName").textContent =
        suspect.name;

    document.getElementById("suspectRole").textContent =
        suspect.role;

    document.getElementById("suspectAvatar").textContent =
        suspect.avatar;

    document.getElementById("initialName").textContent =
        suspect.name;

    document.getElementById("initialDialogue").textContent =
        suspect.initial;

    updateMeters();

    clearConversation();

    showScreen("interrogationScreen");

    console.log(
        "Suspects interrogated:",
        gameState.interrogatedSuspects
    );
}

// ================= CLEAR CHAT =================

function clearConversation() {

    const conversation =
        document.getElementById("conversation");

    conversation.innerHTML = "";

    addWitnessMessage(
        gameState.suspects[gameState.currentSuspect].initial
    );
}


// ================= ADD PLAYER MESSAGE =================

function addPlayerMessage(text) {

    const conversation =
        document.getElementById("conversation");

    const message =
        document.createElement("div");

    message.className = "message player";

    message.innerHTML = `
        <div class="message-name">YOU</div>
        <p>${escapeHTML(text)}</p>
    `;

    conversation.appendChild(message);

    conversation.scrollTop = conversation.scrollHeight;
}


// ================= ADD WITNESS MESSAGE =================

function addWitnessMessage(text) {

    const conversation =
        document.getElementById("conversation");

    const suspect =
        gameState.suspects[gameState.currentSuspect];

    const message =
        document.createElement("div");

    message.className = "message witness";

    message.innerHTML = `
        <div class="message-name">${suspect.name}</div>
        <p>${escapeHTML(text)}</p>
    `;

    conversation.appendChild(message);

    conversation.scrollTop = conversation.scrollHeight;
}


// ================= ASK QUESTION =================
function askQuestion() {

    const input =
        document.getElementById("questionInput");

    const question =
        input.value.trim();

    if (!question) {
        return;
    }

    // Maximum 5 questions per suspect
    if (gameState.questionCount >= 5) {

        alert(
            "You have asked all 5 questions to this suspect."
        );

        return;
    }

    // Count this question
    gameState.questionCount++;

    addPlayerMessage(question);

    gameState.conversations.push({
        suspect: gameState.currentSuspect,
        player: question
    });

    input.value = "";

    // Temporary fake AI response
    // Later Node + OpenAI will replace this.

    setTimeout(() => {
        generateTemporaryResponse(question);
    }, 700);
}


// ================= TEMPORARY AI =================

function generateTemporaryResponse(question) {

    const suspect =
        gameState.suspects[gameState.currentSuspect];

    const lower =
        question.toLowerCase();

    let response =
        suspect.responses.default;


    if (
        lower.includes("11") ||
        lower.includes("eleven") ||
        lower.includes("where were") ||
        lower.includes("where")
    ) {

        response = suspect.responses.kitchen;

    }


    else if (
        lower.includes("varen") ||
        lower.includes("lord")
    ) {

        response = suspect.responses.varen;

    }


    else if (
        lower.includes("east") ||
        lower.includes("upstairs")
    ) {

        response = suspect.responses.east;

    }


    // Increase suspicion when player asks direct questions

    suspect.suspicion += 4;

    suspect.trust -= 2;


    // If player mentions evidence

    if (
        lower.includes("key") ||
        lower.includes("blood") ||
        lower.includes("footprint") ||
        lower.includes("poison")
    ) {

        suspect.suspicion += 8;

        suspect.trust -= 5;

        response +=
            " I don't know why you would bring that up.";

    }


    updateMeters();

    addWitnessMessage(response);

    checkForEvidence(question);

}


// ================= EVIDENCE =================

function checkForEvidence(question) {

    const lower =
        question.toLowerCase();

    let newEvidence = null;


    if (
        lower.includes("east") &&
        !gameState.evidence.includes("East Wing Key")
    ) {

        newEvidence = "East Wing Key";

    }


    else if (
        lower.includes("blood") &&
        !gameState.evidence.includes("Blood on Staircase")
    ) {

        newEvidence = "Blood on Staircase";

    }


    else if (
        lower.includes("wine") &&
        !gameState.evidence.includes("Poisoned Wine")
    ) {

        newEvidence = "Poisoned Wine";

    }


    if (newEvidence) {

        gameState.evidence.push(newEvidence);

        updateEvidence();

        addWitnessMessage(
            "..."

        );

    }

}


// ================= UPDATE EVIDENCE UI =================

function updateEvidence() {

    const list =
        document.getElementById("evidenceList");

    list.innerHTML = "";


    gameState.evidence.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "evidence-card";

        card.innerHTML = `
            🔎
            <span>${item}</span>
        `;

        list.appendChild(card);

    });


    if (gameState.evidence.length === 0) {

        list.innerHTML = `
            <div class="evidence-card locked">
                🔒
                <span>No evidence discovered yet</span>
            </div>
        `;

    }

}


// ================= UPDATE METERS =================

function updateMeters() {

    const suspect =
        gameState.suspects[gameState.currentSuspect];

    if (!suspect) return;


    document.getElementById("trustValue").textContent =
        suspect.trust + "%";

    document.getElementById("suspicionValue").textContent =
        suspect.suspicion + "%";


    document.getElementById("trustBar").style.width =
        suspect.trust + "%";

    document.getElementById("suspicionBar").style.width =
        suspect.suspicion + "%";
}


// ================= QUICK QUESTIONS =================

function quickQuestion(question) {

    document.getElementById("questionInput").value =
        question;

    askQuestion();

}


// ================= ACCUSATION =================

function openAccusation() {

    if (gameState.interrogatedSuspects.length < 3) {

        alert(
            "You must interrogate all three suspects before making an accusation."
        );

        return;
    }

    showScreen("accusationScreen");
}


// ================= MAKE ACCUSATION =================

function makeAccusation(accused) {

    /*
        TEMPORARY GAME LOGIC

        For our first prototype,
        KAEL is the real killer.

        Later we can make this dynamic
        and AI-driven.
    */

    const endingTitle =
        document.getElementById("endingTitle");

    const endingText =
        document.getElementById("endingText");

    const endingStats =
        document.getElementById("endingStats");


    if (accused === "kael") {

        endingTitle.textContent =
            "THE TRUTH";

        endingText.textContent =
            "Your evidence was enough. Kael abandoned his post, entered the east wing, and poisoned Lord Varen. The smallest contradiction became the key to the entire case.";

    }

    else {

        endingTitle.textContent =
            "WRONG ACCUSATION";

        endingText.textContent =
            "You accused the wrong person. Somewhere inside the estate, the real killer is still free.";

    }


    endingStats.innerHTML = `
        Evidence discovered:
        <strong>${gameState.evidence.length}</strong>
        <br><br>
        Witnesses questioned:
        <strong>${gameState.conversations.length}</strong>
    `;


    showScreen("endingScreen");

}


// ================= VOICE INPUT =================

let recognition = null;


function startListening() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        document.getElementById("voiceStatus").textContent =
            "Voice input isn't supported in this browser. Please type your question.";

        return;
    }


    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.continuous = false;


    recognition.onstart = function () {

        document.getElementById("voiceStatus").textContent =
            "🎙 Listening... Speak now.";

    };


    recognition.onresult = function(event) {

        const text =
            event.results[0][0].transcript;

        document.getElementById("questionInput").value =
            text;

        document.getElementById("voiceStatus").textContent =
            "Voice captured. Press ASK QUESTION.";

    };


    recognition.onerror = function() {

        document.getElementById("voiceStatus").textContent =
            "Could not hear you. Try again or type your question.";

    };


    recognition.onend = function() {

        console.log("Voice recognition ended.");

    };


    recognition.start();
}


// ================= SAFETY =================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
// ===============================
// CASE SELECTION SYSTEM
// ===============================

let selectedCase = 1;

const cases = {
    1: {
        title: "THE DEATH OF LORD VAREN"
    },
    2: {
        title: "THE MISSING HEIR"
    },
    3: {
        title: "MURDER ON PLATFORM 9"
    },
    4: {
        title: "THE RED ROOM"
    },
    5: {
        title: "THE VANISHING WITNESS"
    }
};

function selectCase(caseNumber) {

    selectedCase = caseNumber;

    const cards = document.querySelectorAll(".case-card");

    cards.forEach(card => {
        card.classList.remove("active");
    });

    if (cards[caseNumber - 1]) {
        cards[caseNumber - 1].classList.add("active");
    }

    const selectedText = document.getElementById("selectedCaseText");

    if (selectedText) {
        selectedText.innerText =
            "Selected: CASE " +
            String(caseNumber).padStart(2, "0") +
            " — " +
            cases[caseNumber].title;
    }

    console.log("Selected Case:", caseNumber);
}
function beginSelectedCase() {

    gameState.interrogatedSuspects = [];

    console.log("Starting Case:", selectedCase);

    

    // ================= CASE DATA =================

    const caseDetails = {

        1: {
            title: "THE VAREN MURDER",
            location: "THE VAREN ESTATE",
            description: "The castle is silent. Three witnesses remain.",
            suspects: {
                mira: {
                    name: "MIRA",
                    role: "THE MAID",
                    avatar: "M",
                    trust: 50,
                    suspicion: 10,
                    initial: "You wanted to speak with me? I... I don't know what else I can tell you.",
                    secret: "Mira saw someone near the east wing.",
                    responses: {
                        kitchen: "I was in the kitchen. I stayed there almost the entire night.",
                        varen: "Lord Varen was difficult. But I had no reason to hurt him.",
                        east: "The east wing? No. I never went there that night.",
                        default: "I don't understand what you're suggesting."
                    }
                },

                kael: {
                    name: "KAEL",
                    role: "THE GUARD",
                    avatar: "K",
                    trust: 50,
                    suspicion: 10,
                    initial: "Ask your questions. I have nothing to hide.",
                    secret: "Kael abandoned his post.",
                    responses: {
                        kitchen: "I was guarding the main hall.",
                        varen: "The Lord was alive when I last saw him.",
                        east: "I had no business in the east wing.",
                        default: "You're wasting time. Find actual evidence."
                    }
                },

                eron: {
                    name: "ERON",
                    role: "THE MERCHANT",
                    avatar: "E",
                    trust: 50,
                    suspicion: 10,
                    initial: "A murder investigation? How unfortunate. I hope I can be of assistance.",
                    secret: "Eron had a financial dispute with Lord Varen.",
                    responses: {
                        kitchen: "I was preparing to leave the estate around eleven.",
                        varen: "Lord Varen and I had business disagreements.",
                        east: "I certainly wasn't wandering around the east wing.",
                        default: "Interesting question. But I don't see how that relates."
                    }
                }
            }
        },

        2: {
            title: "THE MISSING HEIR",
            location: "THE BLACKWOOD MANOR",
            description: "The heir vanished hours before signing the family inheritance.",
            suspects: {
                helena: {
                    name: "HELENA",
                    role: "THE STEPMOTHER",
                    avatar: "H",
                    trust: 50,
                    suspicion: 10,
                    initial: "My stepson disappeared. I have no idea where he went.",
                    secret: "Helena secretly changed the inheritance documents.",
                    responses: {
                        kitchen: "I was in the dining room.",
                        varen: "The family had been under enormous pressure.",
                        east: "I never went upstairs.",
                        default: "I don't know what you're implying."
                    }
                },

                victor: {
                    name: "VICTOR",
                    role: "THE LAWYER",
                    avatar: "V",
                    trust: 50,
                    suspicion: 10,
                    initial: "I was preparing the inheritance documents.",
                    secret: "Victor knew the heir planned to change the will.",
                    responses: {
                        kitchen: "I was working in my office.",
                        varen: "The family business was complicated.",
                        east: "I had no reason to go upstairs.",
                        default: "That is speculation, detective."
                    }
                },

                rowan: {
                    name: "ROWAN",
                    role: "THE BROTHER",
                    avatar: "R",
                    trust: 50,
                    suspicion: 10,
                    initial: "My brother and I argued, but I didn't hurt him.",
                    secret: "Rowan wanted the inheritance for himself.",
                    responses: {
                        kitchen: "I was outside near the garden.",
                        varen: "We argued about the inheritance.",
                        east: "I never entered his room.",
                        default: "You're looking at the wrong person."
                    }
                }
            }
        },

        3: {
            title: "MURDER ON PLATFORM 9",
            location: "NORTHBRIDGE STATION",
            description: "A businessman was found dead beside an empty train.",
            suspects: {
                aria: {
                    name: "ARIA",
                    role: "THE CONDUCTOR",
                    avatar: "A",
                    trust: 50,
                    suspicion: 10,
                    initial: "The station was nearly empty that night.",
                    secret: "Aria saw someone board the train.",
                    responses: {
                        kitchen: "I was checking the final carriage.",
                        varen: "I didn't know the victim personally.",
                        east: "I never went near Platform 9.",
                        default: "I already told you what I saw."
                    }
                },

                daniel: {
                    name: "DANIEL",
                    role: "THE BUSINESS PARTNER",
                    avatar: "D",
                    trust: 50,
                    suspicion: 10,
                    initial: "We were supposed to meet that evening.",
                    secret: "Daniel owed the victim a large amount of money.",
                    responses: {
                        kitchen: "I was waiting near the ticket hall.",
                        varen: "We had a business disagreement.",
                        east: "I stayed away from Platform 9.",
                        default: "This has nothing to do with me."
                    }
                },

                marcus: {
                    name: "MARCUS",
                    role: "THE NIGHT CLEANER",
                    avatar: "M",
                    trust: 50,
                    suspicion: 10,
                    initial: "I was cleaning the station all night.",
                    secret: "Marcus found the victim's briefcase.",
                    responses: {
                        kitchen: "I was cleaning the western platform.",
                        varen: "I had never met him before.",
                        east: "I saw someone near Platform 9.",
                        default: "I don't remember anything else."
                    }
                }
            }
        },

        4: {
            title: "THE RED ROOM",
            location: "THE ASHWOOD HOUSE",
            description: "A famous author is dead inside a room locked from the inside.",
            suspects: {
                evelyn: {
                    name: "EVELYN",
                    role: "THE PUBLISHER",
                    avatar: "E",
                    trust: 50,
                    suspicion: 10,
                    initial: "He was working on his final manuscript.",
                    secret: "Evelyn feared the manuscript would expose her.",
                    responses: {
                        kitchen: "I was downstairs speaking with the guests.",
                        varen: "The author had become difficult recently.",
                        east: "I never entered the red room.",
                        default: "You're misunderstanding the situation."
                    }
                },

                thomas: {
                    name: "THOMAS",
                    role: "THE BROTHER",
                    avatar: "T",
                    trust: 50,
                    suspicion: 10,
                    initial: "My brother and I had our differences.",
                    secret: "Thomas was removed from the author's will.",
                    responses: {
                        kitchen: "I was outside smoking.",
                        varen: "We argued about the inheritance.",
                        east: "I stayed away from his study.",
                        default: "I had nothing to gain from his death."
                    }
                },

                julian: {
                    name: "JULIAN",
                    role: "THE ASSISTANT",
                    avatar: "J",
                    trust: 50,
                    suspicion: 10,
                    initial: "I was helping him with his manuscript.",
                    secret: "Julian knew about the hidden passage.",
                    responses: {
                        kitchen: "I was organizing his papers.",
                        varen: "He trusted me completely.",
                        east: "I never used the hidden passage.",
                        default: "I don't know what you mean."
                    }
                }
            }
        },

        5: {
            title: "THE VANISHING WITNESS",
            location: "RAVENWOOD HOTEL",
            description: "The only witness to a murder vanished before police arrived.",
            suspects: {
                nora: {
                    name: "NORA",
                    role: "THE RECEPTIONIST",
                    avatar: "N",
                    trust: 50,
                    suspicion: 10,
                    initial: "I remember seeing the witness before she disappeared.",
                    secret: "Nora received a mysterious phone call.",
                    responses: {
                        kitchen: "I was working at the front desk.",
                        varen: "I don't know the victim.",
                        east: "I saw someone near the east corridor.",
                        default: "That's all I remember."
                    }
                },

                adrian: {
                    name: "ADRIAN",
                    role: "THE DETECTIVE",
                    avatar: "A",
                    trust: 50,
                    suspicion: 10,
                    initial: "I arrived after the witness disappeared.",
                    secret: "Adrian arrived earlier than he claims.",
                    responses: {
                        kitchen: "I was checking the lobby.",
                        varen: "I was investigating the original murder.",
                        east: "I never went down that corridor.",
                        default: "You're asking the wrong questions."
                    }
                },

                felix: {
                    name: "FELIX",
                    role: "THE HOTEL GUEST",
                    avatar: "F",
                    trust: 50,
                    suspicion: 10,
                    initial: "I was simply staying at the hotel.",
                    secret: "Felix spoke to the missing witness.",
                    responses: {
                        kitchen: "I was in my room.",
                        varen: "I didn't know anything about the murder.",
                        east: "I never entered that corridor.",
                        default: "I have nothing more to say."
                    }
                }
            }
        }
    };


    // Save selected case suspects
    gameState.suspects = caseDetails[selectedCase].suspects;

    // Update case title
    document.querySelector("#investigationScreen .game-header h2").textContent =
        caseDetails[selectedCase].title;

    // Update location
    document.querySelector("#investigationScreen .location-box h1").textContent =
        caseDetails[selectedCase].location;

    document.querySelector("#investigationScreen .location-box p:last-child").textContent =
        caseDetails[selectedCase].description;


    // ================= CREATE SUSPECT CARDS =================

    const suspectGrid =
        document.querySelector(".suspect-grid");

    suspectGrid.innerHTML = "";

    Object.keys(gameState.suspects).forEach(id => {

        const suspect = gameState.suspects[id];

        const card = document.createElement("div");

        card.className = "suspect-card";

        card.onclick = function() {
            selectSuspect(id);
        };

        card.innerHTML = `
            <div class="avatar">${suspect.avatar}</div>

            <h3>${suspect.name}</h3>

            <p class="role">${suspect.role}</p>

            <p>${suspect.initial}</p>

            <button type="button">
                INTERROGATE
            </button>
        `;

        suspectGrid.appendChild(card);

    });


    // Reset evidence for new case
    gameState.evidence = [];
    updateEvidence();


    // Show investigation
    if (caseScreen) {
        caseScreen.classList.remove("active");
        caseScreen.style.display = "none";
    }

    if (investigationScreen) {
        investigationScreen.classList.add("active");
        investigationScreen.style.display = "block";
    }

}