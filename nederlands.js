class Card {
    constructor() {
        this.state = 'init';
        this.node = document.getElementById("card")
        this.node.onclick = () => this.onAnswer();
        document.getElementById("btn-y").onclick = () => this.onRight();
        document.getElementById("btn-n").onclick = () => this.onWrong();
    }

    reset(q, a, onDone) {
        this.question = q;
        this.answer = a;
        this.onDone = onDone;
        this.state = 'question';

        this.node.innerText = this.question;
        document.getElementById("answer").style.display = "none";
    }

    onAnswer() {
        if (this.state !== 'question') {
            return;
        }
        this.state = 'answer';
        this.node.innerText = this.answer;
        document.getElementById("answer").style.display = "flex";
    }

    onRight() {
        if (this.state !== 'answer') {
            return;
        }
        this.state = 'done';
        this.onDone(true);
    }

    onWrong() {
        if (this.state !== 'answer') {
            return;
        }
        this.state = 'done';
        this.onDone(false);
    }
}

DICTS = {
    "adjectives-dec-23": [
        { ru: "длинный", nl: "lang" },
        { ru: "короткий", nl: "kort" },
        { ru: "высокий", nl: "hoog" },
        { ru: "низкий", nl: "laag" },
        { ru: "толстый", nl: "vet" },
        { ru: "худой", nl: "slank" },
        { ru: "светлый", nl: "light" },
        { ru: "темный", nl: "donker" },
        { ru: "узкий", nl: "dun" },
        { ru: "широкий", nl: "dik" },
        { ru: "открытый", nl: "open" },
        { ru: "закрытый", nl: "dicht" },
        { ru: "кислый", nl: "zuur" },
        { ru: "сладкий", nl: "zoet" },
        { ru: "быстрый", nl: "snel" },
        { ru: "медленный", nl: "traag" },
        { ru: "сложный", nl: "moeilijk" },
        { ru: "простой", nl: "gemakkelijk" },
        { ru: "пустой", nl: "leeg" },
        { ru: "полный", nl: "vol" },
        { ru: "счастливый", nl: "gelukkig" },
        { ru: "грусный", nl: "verdrietig" },
        { ru: "холодный", nl: "koud" },
        { ru: "теплый", nl: "warm" },
        { ru: "красивый", nl: "mooi" },
        { ru: "уродливый", nl: "lelijk" },
        { ru: "короткий", nl: "kort" },
        { ru: "длинный", nl: "lang" },
        { ru: "голый", nl: "naakt" },
        { ru: "одетый", nl: "gekleed" },
        { ru: "прямой", nl: "stijl" },
        { ru: "вьющийся", nl: "gekruld" },
        { ru: "влажный", nl: "nat" },
        { ru: "сухой", nl: "droog" },
        { ru: "много", nl: "veel" },
        { ru: "мало", nl: "weinig" },
        { ru: "бедный", nl: "arm" },
        { ru: "богатый", nl: "rijk" },
        { ru: "тупой", nl: "versleten" },
        { ru: "острый", nl: "scherp" },
        { ru: "гладкий", nl: "glad" },
        { ru: "с колючками", nl: "met stekels" },
        { ru: "правый", nl: "rechter" },
        { ru: "левый", nl: "linker" },
        { ru: "съедобный", nl: "eetbaar" },
        { ru: "ядовитый", nl: "giftig" },
        { ru: "пугающий", nl: "gemeen" },
        { ru: "дружелюбный", nl: "lief" },
        { ru: "черно-белый", nl: "zwart-wit" },
        { ru: "цветной", nl: "gekleurd" },
        { ru: "нижний", nl: "onder" },
        { ru: "верхний", nl: "boven" },
        { ru: "хрупкий", nl: "zwak" },
    ],
    "test": [
        { ru: "ходить", nl: "gaan" },
        { ru: "иметь", nl: "hebben" },
        { ru: "быть", nl: "zijn" }
    ]
}

class Main {
    constructor() {
        this.card = new Card();
        this.id = -1;
        this.words = DICTS["adjectives-dec-23"];
        for (let word of this.words) {
            word.total = 0;
            word.right = 0;
            word.maCorrect = 0.5; // correctness moving average
        };
        console.log(this.words);
    }

    getWeight(w) {
        return 1 - w.maCorrect;
    }

    isEligible(id, w) {
        if (id == this.id) {
            return false;
        }
        if (w.maCorrect > 0.90) {
            return false;
        }
        return true;
    }

    select() {
        let weights = [];
        let totalWeight = 0;
        for (let i = 0; i < this.words.length; i++) {
            if (!this.isEligible(i, this.words[i])) {
                continue;
            }
            totalWeight += this.getWeight(this.words[i]);
            console.log("CORRECTNESS", i, this.words[i].nl, this.words[i].maCorrect);
        }
        if (totalWeight == 0) {
            return -1;
        }
        let p = Math.random() * totalWeight;
        let w = 0;
        for (let i = 0; i < this.words.length; i++) {
            if (!this.isEligible(i, this.words[i])) {
                continue;
            }
            w += this.getWeight(this.words[i]);
            if (p < w) {
                return i;
            }
        }
        console.log("Error generating random word id in Main.select()");
        return this.words.length - 1;
    }

    run() {
        this.id = this.select();
        if (this.id == -1) {
            this.congratulate();
            return;
        }
        this.word = this.words[this.id];
        console.log("SELECTED", this.id, this.word.nl);
        this.card.reset(this.word.ru, this.word.nl, (isCorrect) => this.gatherResult(isCorrect));
    }

    congratulate() {
        document.getElementById("card").innerText = "Je hebt deze woorden geleerd!";
        document.getElementById("answer").style.display = "none";
    }

    gatherResult(isCorrect) {
        console.log("RESULT", isCorrect);
        this.word.total++;
        if (isCorrect) {
            this.word.right++;
        }
        let maCoef = 0.5;
        this.word.maCorrect = maCoef * this.word.maCorrect + (1 - maCoef) * (isCorrect ? 1 : 0);
        this.run();
    }
}

let main = new Main();
main.run();