class Zurero extends CGFobject {
    constructor(scene)
    {
        console.log("New Zurero Game");
        this.scene=scene;
        this.blackPlayer=new Player(this.scene, 1);
        this.whitePlayer=new Player (this.scene, 2);
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



    }

    startGame(gameMode, gameDifficulty){
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
        this.player = 1; //primeiro jogador é o preto
        this.previousPlayer=1;
        this.moves=[];
        this.board=[];
        //get the initial Board
        this.scene.client.getPrologRequest(
            "getInitialBoard",
            function(data){
                if(data.target.response.length == 265)
                {
                
                }
            }
            );



    }


}