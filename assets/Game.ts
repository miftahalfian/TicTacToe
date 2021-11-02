// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

enum Level {
    Easy,
    Medium,
    Hard
}

@ccclass
export default class TicTacToe extends cc.Component {
    @property(cc.Node)
    levelSelection: cc.Node = null;

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Label)
    labelResult: cc.Label = null;

    @property(cc.Node)
    boardBtn: cc.Node[] = [];

    @property(cc.Sprite)
    boardSymbol: cc.Sprite[] = [];

    @property(cc.SpriteFrame)
    imgX: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    imgO: cc.SpriteFrame = null;

    private board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    private human = "X";
    private ai = "O";
    private current_turn = "";
    private level = Level.Easy;
    private awal = true;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.current_turn = this.human;

        this.boardBtn.forEach((btn) => {
            btn.on("click", this.tombolClick, this);
        })
    }

    onLevelChange (toggle: cc.Toggle, customEventData: string) {
        let name = toggle.node.name;
        if (!toggle.isChecked) return;

        if (name == "easy") this.level = Level.Easy;
        else if (name == "medium") this.level = Level.Medium;
        else if (name == "hard") this.level = Level.Hard;
    }

    startClick () {
        this.current_turn = this.human;
        this.awal = true;
        this.board.splice(0, this.board.length);
        this.board = [
            ["", "", ""],
            ["", "", ""],
            ["", "", ""]
        ];

        this.boardSymbol.forEach((symbol) => {
            symbol.node.active = false;
        });

        this.boardBtn.forEach((btn) => {
            let tombol = btn.getComponent(cc.Button);
            tombol.interactable = true;
        });

        this.labelResult.string = this.current_turn + " TURN";
    }

    tombolClick (button: cc.Button) {
        if (this.current_turn != this.human) return;

        let node = button.node;
        let index = this.boardBtn.indexOf(node);
        let a = index % 3;
        let b = Math.floor(index / 3);

        button.interactable = false;

        this.board[b][a] = this.human;
        this.boardSymbol[index].spriteFrame = this.imgX;
        this.boardSymbol[index].node.active = true;
        if (!this.isWin()) this.nextTurn();
    }

    nextTurn () {
        cc.log("next turn");
        this.current_turn = this.current_turn == this.human ? this.ai : this.human;
        this.labelResult.string = this.current_turn + " TURN";

        cc.log(this.current_turn);

        if (this.current_turn == this.ai) this.getBestMove();
    }

    isWin () : boolean {
        let winner = this.checkWinner();

        if (winner != null) {
            
            if (winner == "draw") this.labelResult.string = "DRAW";
            else this.labelResult.string = winner + " WIN";

            return true;
        }

        return false;
    }

    checkWinner () : string {
        let winner = null;

        // Vertical
        for (let i = 0; i < 3; i++) {
            if (this.equals3(this.board[i][0], this.board[i][1], this.board[i][2])) {
                winner = this.board[i][0];
            }
        }

        // Horizontal
        for (let i = 0; i < 3; i++) {
            if (this.equals3(this.board[0][i], this.board[1][i], this.board[2][i])) {
                winner = this.board[0][i];
            }
        }

        // Diagonal
        if (this.equals3(this.board[0][0], this.board[1][1], this.board[2][2])) {
            winner = this.board[0][0];
        }
        if (this.equals3(this.board[2][0], this.board[1][1], this.board[0][2])) {
            winner = this.board[2][0];
        }

        let openSpots = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i][j] == '') {
                    openSpots++;
                }
            }
        }

        if (winner == null && openSpots == 0) {
            return "draw";
        }
        else return winner;
    }

    equals3 (a: string, b: string, c: string) {
        return a == b && b == c && a != "";
    }

    getBestMove () {
        let indexA = 0;
        let indexB = 0;

        cc.log(this.board.toString());

        let bestScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[j][i] == "") {
                    this.board[j][i] = this.ai;
                    let score = this.minimax(this.board, 0, false);
                    this.board[j][i] = "";
                    
                    if (score > bestScore) {
                        bestScore = score;
                        indexA = i;
                        indexB = j;
                    }
                }
            }
        }

        this.board[indexB][indexA] = this.ai;
            
        let idx = 3 * indexB + indexA;
        this.boardSymbol[idx].spriteFrame = this.imgO;
        this.boardSymbol[idx].node.active = true;

        let btn = this.boardBtn[idx].getComponent(cc.Button);
        btn.interactable = false;

        if (!this.isWin()) this.nextTurn();
    }

    minimax (board: string[][], depth: number, isMaximizing: boolean) : number {
        let result = this.checkWinner();
        if (result !== null) {
            cc.log("depth:" + depth);
            if (result == this.ai) return 10;
            else if (result == this.human) return -10;
            else return 0;
        }

        if (this.level == Level.Easy && depth > 3) return -10;
        else if (this.level == Level.Medium && depth > 5) return -10; 

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[j][i] == "") {
                        board[j][i] = this.ai;
                        let score = this.minimax(board, depth + 1, false);
                        board[j][i] = "";
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }

            return bestScore;
        }
        else {
            let bestScore = Infinity;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (board[j][i] == "") {
                        board[j][i] = this.human;
                        let score = this.minimax(board, depth + 1, true);
                        board[j][i] = "";
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }

            return bestScore;
        }
    }

    // update (dt) {}
}
