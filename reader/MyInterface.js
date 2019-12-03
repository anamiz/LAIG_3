/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();



        this.initKeys();

        return true;
    }

    
    /**
     *a) fontes de Luz - descrição e ON/OFF
     */

     addLights(lights)
     {
         var lightsFolder = this.gui.addFolder('Lights');
         lightsFolder.open();

         for(var key in lights)
         {
            if (lights.hasOwnProperty(key)) {

             this.scene.lightsKey[key]=lights[key][0];
             lightsFolder.add(this.scene.lightsKey, key);
         }
     }
    }

        /**
         * b) seleção da vista ativa
         */

        addViews(views)
         {
             var viewsKey = [];
             for(var key in views)
             {
                viewsKey.push(key);
             }
            var c = this.gui.add(this.scene, 'selectedCamera', viewsKey).name('Selected Camera');
            c.onChange(this.scene.changeCamera.bind(this.scene));

        }






    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}