/**
* KeyframeAnimation
* @constructor
*/
 
var DEGREE_TO_RAD = Math.PI / 180;
 
 
class MyKeyframeAnimation extends MyAnimation{
    constructor(scene,id,values){
        super(scene);
        this.id=id;
        this.values=values;
        this.updatePeriod = 15;
        this.translate=[0,0,0];
        this.scale=[1,1,1];
        this.rotate=[0,0,0];
        this.currentTime=0;
        this.frameTime=0;
        this.keyframe=0;
        }
 
    update(t){
       
        this.currentTime += t;
 
        if(this.keyframe<this.values.length){
            if(this.keyframe==0){
                this.frameTime=this.values[0][0];
                if(this.currentTime<=this.frameTime){
                    for(var j=0;j<3;j++){
                        this.translate[j]+=(this.values[0][3][j]*t/this.frameTime);
                       
                           
                    }
                   
                    /*for(var k=0;k<3;k++){
                        this.scale[k]=(this.values[0][2][k]*this.currentTime/this.frameTime);
                       
                           
                    }*/
               
                    for (var p=0;p<3;p++){
                        this.rotate[p]+=(this.values[this.keyframe][1][p]*DEGREE_TO_RAD)*t/this.frameTime;
                    }
                   
                   
                       
               
                }
                else{
                    this.keyframe++;
                    this.currentTime=0.000000000001;
                }
            }
            else{
               
                this.frameTime=this.values[this.keyframe][0]-this.values[this.keyframe-1][0];
                if(this.currentTime<=this.frameTime){
                    for(var j=0;j<3;j++){
                        this.translate[j]+=(((this.values[this.keyframe][3][j]))*t/this.frameTime);
                       
                           
                    }
                   
                    /*for(var k=0;k<3;k++){
                        this.scale[k]=(this.values[this.keyframe][2][k]*this.currentTime/this.frameTime);
                       
                           
                    }*/
               
                    for (var p=0;p<3;p++){
                        this.rotate[p]+=(this.values[this.keyframe][1][p]*DEGREE_TO_RAD)*t/this.frameTime;
                    }
                   
                   
                       
               
                }
                else{
                    this.keyframe++;
                    this.currentTime=0.000000000000000000001;
                }
               
            }
            this.asd=t;
            //console.log("keyframe: " + this.keyframe);
        }
           
       
       
       
       
       
    }
    apply(){
        //this.values[0][3][0],this.values[0][3][1],this.values[0][3][2]
        this.scene.translate(this.translate[0],this.translate[1] , this.translate[2]);
        this.scene.rotate(this.rotate[0], 1, 0, 0);
        this.scene.rotate(this.rotate[1], 0, 1, 0);
        this.scene.rotate(this.rotate[2], 0, 0, 1);
        /*this.scene.scale(this.scale[0],this.scale[1], this.scale[2]);*/
        //console.log("tempo: " + this.rotate[1]);
       
    }
     
     
}