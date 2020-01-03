class Zurero extends CGFobject {
    constructor(scene)
    {
		super(scene);
        console.log("New Zurero Game");
        this.scene=scene;
        this.blackPlayer=new Player(this.scene, 1);
        this.whitePlayer=new Player (this.scene, 2);
        this.player = 1; //primeiro jogador é o preto
        this.previousPlayer=1;

        this.mode = {
            HVSH: 0,
            HVSPC: 1,
            PCVSPC: 2
        };

        this.difficulty = {
            EASY: 0,
            HARD: 1
        };
        //maquina de estados para o estado do jogo -- necessario??
        this.gameState = {
            WAITING_START: 0,
            FIRST_MOVE_BLACK: 1,
            MOVE_WHITE: 2,
            MOVE_BLACK: 3,
            WON_GAME: 4,
            DRAW_GAME: 5,
            QUIT_GAME: 6,
            PROLOG_CONNECTION_ERROR: 7
        }
        this.currentState=this.gameState.WAITING_START;
        this.previousState = this.gameState.WAITING_START;
        this.board=[];
        this.moves=[];
        


    }

    startGame(gameMode, gameDifficulty){
        if(this.currentState == this.gameState.WAITING_START)
        {
        switch(gameMode){
            case "Player vs Player":{this.gameMode = this.mode.HVSH; break;}
            case "Player vs Computer":{this.gameMode = this.mode.HVSPC; break;}
            case "Computer vs Computer": {this.gameMode = this.mode.PCVSPC; break;}
            default: break;
        }
        switch(gameDifficulty)
        {
            case "Easy": this.gameDifficulty=this.difficulty.EASY; break;
            case "Hard": this.gameDifficulty=this.difficulty.HARD; break;
            default: break;
        }

        this.getInitialBoard();

        }
    }

    getInitialBoard()
    {
        //get the initial Board
        var zurero=this;
        this.scene.client.getPrologRequest(
            "getInitialBoard",
            function(data){
                if(data.target.response.length == 761)
                {
                zurero.board=zurero.boardToJS(data.target.response);
                zurero.currentState = zurero.gameState.FIRST_MOVE_BLACK;}
            },
            function(data) { console.log("Connection Error in getInitialBoard");}
        );
    }



    firstMove(letra, numero)
    {
        if(this.currentState == this.gameState.FIRST_MOVE_BLACK){
        this.previousState = this.currentState;
        var command = "first("+"'"+letra+"'"+","+numero+")";
        var zurero=this;
        this.scene.client.getPrologRequest(
            command,
            function(data)
            {
                if(data.target.response.length == 761)
                {
                    zurero.board=zurero.boardToJS(data.target.response);
                    zurero.currentState=zurero.gameState.MOVE_WHITE;
                }
            },
            function(data){console.log("Connection Error in first move");}
        )
        this.nextPlayer();
        }
    }

    movePiece(orientation, value)
    {
        if(this.currentState == this.gameState.MOVE_BLACK || this.currentState == this.gameState.MOVE_WHITE){
        var command = "movePiece(" + this.player + "," + this.boardToProlog(this.board) + "," +"'"+ orientation+"'" + ","+value + ")";
        var zurero=this;
        this.scene.client.getPrologRequest(
            command,
            function(data)
            {
                if(data.target.response.length == 761)
                {
                    zurero.board=zurero.boardToJS(data.target.response);
                }
            },
            function(data){console.log("Connection Error in first move");}
        )
        this.previousState = this.currentState;
        this.check_state();
        if(this.currentState == this.gameState.WON_GAME)
        {
            console.log("Player "+this.player+" has won");
        }
        else if(this.currentState == this.gameState.MOVE_BLACK)
        {
            this.currentState = this.gameState.MOVE_WHITE;
        }
        else{this.currentState = this.gameState.MOVE_BLACK;}
        this.nextPlayer();
    }
    }


    check_state() //Ve se o current player ganhou
    {
        var command = "check_state(" + this.player + "," + this.boardToProlog(this.board)+")";
        var zurero=this;
        this.scene.client.getPrologRequest(
            command,
            function(data)
            {
                if(data.target.response == "1")
                {
                    zurero.currentState = zurero.gameState.WON_GAME;
                }
            },
            function(data){console.log("Connection Error in first move");}
        )

    }

    quitGame()
    {
        if(this.currentState != this.gameState.WAITING_START)
        {
            this.currentState=this.gameState.QUIT_GAME;
            console.log("Game has ended");
            this.getInitialBoard(); //limpa o board
        }
    }


    undo(){  //TODO
        if(this.gameMode ==this.mode.HVSH)
        {
            if(this.currentState != this.gameState.WAITING_START)
            {
                if(this.moves.length > 0)
                {
                    console.log("Undoing Move");
                    var previousMove = this.moves[this.moves.length -1];
                    
                }
            }
        }
    }
    nextPlayer()
    {
        this.previousPlayer = this.player;
        switch(this.player)
        {
            case 1: this.player=2; break;
            case 2: this.player = 1; break;
            default: break;
        }
        /*this.previousPlayer = this.player;
        var command = "nextPlayer(" + this.player + ")";
        this.scene.client.getPrologRequest(
            command,
            function(data)
            {
                zurero.player=data.target.response;
            },
            function(data){console.log("Connection Error in next player");}
        )*/
    }


    boardToJS(strBoard)
    {
        var board = [];
        var i=0;
        for(let numLinhas=0; numLinhas<19 ; numLinhas++)
        {
            var linha = [];
            var numColuna = 0;
            while(numColuna != 19)
            {
                if(strBoard[i] != "[" && strBoard[i] != "," && strBoard[i] != "]")
                {
                    linha.push(Number(strBoard[i]));
                    numColuna++;
                }
                i++;
            }
            board.push(linha);
        }
        return board;
    }

    boardToProlog(arrBoard)
    {
        var board = "[";
        for(let i=0; i<arrBoard.length; i++)
        {
            board = board + "[";
            for(let j=0; j<arrBoard[i].length ; j++)
            {
                var elem;
                switch(arrBoard[i][j])
                {
                    case 0: 
                    elem="0";
                    break;
                    case 1: elem="1"; break;
                    case 2: elem="2"; break;
                    default: break;
                }
                board = board + elem;
                if(j != arrBoard[i].length - 1) board = board + ",";

            }
            board = board + "]";
            if(i != arrBoard.length - 1) board = board + ",";


        }
        board = board + "]";
        return board;

    }

}