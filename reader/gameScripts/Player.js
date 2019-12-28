class Player extends CGFobject
{
    constructor(scene, playerID)
    {
        super(scene);
        this.playerID=playerID;
        if(this.playerID == 1)
        {
            this.colour = "black";
        }
        else if(this.playerID == 2)
        {this.colour= "white";}
    }



}