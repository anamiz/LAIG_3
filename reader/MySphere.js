/**
* MySphere
* @constructor
*/
class MySphere extends CGFobject {
    constructor(scene, id, radius,  slices, stacks) {
        super(scene);
        this.slices = slices;
        this.radius = radius;
        this.stacks=stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords=[];

        var ang = 0;
        var alphaAng = 2*Math.PI/this.slices;
        var theta=0;
        var alphaTheta=2*Math.PI / this.stacks;


        var texS=1/this.slices;
        var texT=1/this.stacks;
        
    for(var j=0; j<this.stacks; j++)
    {
        for(var i = 0; i < this.slices+1; i++){
            var sa=Math.sin(ang);
            var ca=Math.cos(ang);
            this.vertices.push(ca*this.radius*Math.cos(theta),  -sa*this.radius*Math.cos(theta) , this.radius* Math.sin(theta));
            this.normals.push(ca*this.radius*Math.cos(theta),  -sa*this.radius*Math.cos(theta) , this.radius* Math.sin(theta));
            this.texCoords.push(1-i*texS, 1-j*texT);
            
            ang+=alphaAng;
        }
        theta += alphaTheta;
    }

    for(var j=0; j< this.stacks; j++)
    {for(var i=0; i<this.slices+1; i++){
        this.indices.push(i+j*(1+this.slices), i+1+j*(1+this.slices), i+(j+1)*(1+this.slices));
        this.indices.push(i+1+j*(1+this.slices),i+1+(j+1)*(1+this.slices),i+(j+1)*(1+this.slices) );
    }}



    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();

    
}

    
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}