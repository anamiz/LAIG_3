var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        this.defaultView=this.defaultView;
        // File reading 
        this.reader = new CGFXMLreader();
		
		// Picking
		this.scene.setPickEnabled(true);
		this.objects = [];

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse ambient block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");
 
            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }
        console.log("animations" + index);

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }
        console.log("primitivess" + index);

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
	 
    parseView(viewsNode) {
		var oneView=false;
        var children = viewsNode.children;
        if(children.length == 0) {return "at least one view must be defined";}
        this.views=[];
        var grandChildren = [];
        

        //check default name 
        this.defaultView = this.reader.getString(viewsNode, 'default'); 
        this.scene.selectedCamera=this.defaultView;
        this.scene.selectedSC=this.defaultView;


        
        for(var i=0; i<children.length; i++)
        {
			var nodeNames = [];
            if(children[i].nodeName != 'perspective' && children[i].nodeName != 'ortho')
            {this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
            continue;}

            //PARSE VIEW NON SPECIFIC PROPERTIES
            var viewId = this.reader.getString(children[i], 'id');
            var viewNear =this.reader.getFloat(children[i], 'near');
            var viewFar =this.reader.getFloat(children[i], 'far');

            if(viewId == null){return "no id defined for view";}
            if(viewNear == null){return "no near defined for view";}
            if(viewFar == null){return "no far defined for view";}
            if(viewFar <viewNear) {return "far value lower than near";}

            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";


            //PARSE TO AND FROM
            grandChildren=children[i].children;

            for(var j=0; j<grandChildren.length; j++)
            {
                nodeNames.push(grandChildren[j].nodeName);
            }
            //to and from index (assumindo que to and from podem ser trocados)
            var toIndex=nodeNames.indexOf("to");
            var fromIndex=nodeNames.indexOf("from");

            if(toIndex == -1 || fromIndex == -1) {return "problem with to or from index";}

            //default
            var from=[0,0,0];
            var to = [0,0,0];

            //FROM parse
            from[0] = this.reader.getFloat(grandChildren[fromIndex], 'x');
            from[1] = this.reader.getFloat(grandChildren[fromIndex], 'y');
            from[2] = this.reader.getFloat(grandChildren[fromIndex], 'z');

            //TO parse
            to[0] = this.reader.getFloat(grandChildren[toIndex], 'x');
            to[1] = this.reader.getFloat(grandChildren[toIndex], 'y');
            to[2] = this.reader.getFloat(grandChildren[toIndex], 'z');



            //PARSE VIEW SPECIFIC PROPERTIES
            if(children[i].nodeName == "perspective")
            {
                
                var angle=this.reader.getFloat(children[i], 'angle');
                if(angle == null || isNaN(angle)) {return "unable to parse angle";}
                angle=angle*DEGREE_TO_RAD;
                var perspective = new CGFcamera(angle, viewNear, viewFar, vec3.fromValues(from[0], from[1], from[2]),  vec3.fromValues(to[0], to[1], to[2]));
                this.views[viewId]=perspective;
            
            }
            else 
            {
                var left = this.reader.getFloat(children[i], 'left');
                var right=this.reader.getFloat(children[i],'right');
                var top=this.reader.getFloat(children[i],'top');
                var bottom = this.reader.getFloat(children[i],'bottom');

                if(left == null || isNaN(left)){return "unable to parse component left";}
                if(right == null || isNaN(right)){return "unable to parse component right";}
                if(top == null || isNaN(top)){return "unable to parse component top";}
                if(bottom == null || isNaN(bottom)){return "unable to parse component bottom";}


                var up=[0,1,0];  //default
                var upIndex=nodeNames.indexOf("up");
                if(upIndex != -1)
                {
                    up[0]=this.reader.getFloat(grandChildren[upIndex], 'x');
                    up[1]=this.reader.getFloat(grandChildren[upIndex], 'y');
                    up[2]=this.reader.getFloat(grandChildren[upIndex], 'z');
                }

                var ortho = new CGFcameraOrtho(left, right, bottom, top, viewNear, viewFar, vec3.fromValues(from[0], from[1], from[2]),  vec3.fromValues(to[0], to[1], to[2]),  vec3.fromValues(up[0], up[1], up[2]));
                this.views[viewId] = ortho;
				oneView=true;
            }

        }
    
        if(!oneView)
        {return "Should have at least one view";}
        this.log("Parsed views");
        return null;
	
		
    }
	
	

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
		
        var children=texturesNode.children;
        this.textures=[];
        for(var i=0; i<children.length;i++)
        {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var textureID = this.reader.getString(children[i], 'id');
            if (textureID == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";

            var textureFile = this.reader.getString(children[i], 'file');
            if(textureFile == null)
           { return "no file associated no texture";}
           
           //if there is file, check if it is .jpg ou .png
           if(!textureFile.match(/.(jpg|png)$/i))
           {return "Invalid file extension";}

           var texture = new CGFtexture(this.scene, textureFile);
           this.textures[textureID]=texture;
            
           
        }

        /*if(this.textures.length == 0)
        {
            return "There should be at least one texture defined";
        }*/
        this.log("Parsed textures");
        return null;
		
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];
		
		var oneMaterialDefined = false;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            var materialSpecs = children[i].children;

			var nodeNames = [];
				// Shininess.
			var shininess = this.reader.getFloat(children[i], 'shininess');
			if (shininess == null)
				return "unable to parse shininess value for material with ID = " + materialID;
			else if (isNaN(shininess))
				return "'shininess' is a non numeric value";
			else if (shininess <= 0)
				return "'shininess' must be positive";
			
			
			for (var j = 0; j < materialSpecs.length; j++)
				nodeNames.push(materialSpecs[j].nodeName);

			// Determines the values for each field.
			
			

			// Specular component.
			var specularIndex = nodeNames.indexOf("specular");
			if (specularIndex == -1)
				return "no specular component defined for material with ID = " + materialID;
			var specularComponent = [];
			// R.
			var r = this.reader.getFloat(materialSpecs[specularIndex], 'r');
			if (r == null)
				return "unable to parse R component of specular reflection for material with ID = " + materialID;
			else if (isNaN(r))
				return "specular 'r' is a non numeric value on the MATERIALS block";
			else if (r < 0 || r > 1)
				return "specular 'r' must be a value between 0 and 1 on the MATERIALS block"
			specularComponent.push(r);
			// G.
			var g = this.reader.getFloat(materialSpecs[specularIndex], 'g');
			if (g == null)
				return "unable to parse G component of specular reflection for material with ID = " + materialID;
			else if (isNaN(g))
				return "specular 'g' is a non numeric value on the MATERIALS block";
			else if (g < 0 || g > 1)
				return "specular 'g' must be a value between 0 and 1 on the MATERIALS block";
			specularComponent.push(g);
			// B.
			var b = this.reader.getFloat(materialSpecs[specularIndex], 'b');
			if (b == null)
				return "unable to parse B component of specular reflection for material with ID = " + materialID;
			else if (isNaN(b))
				return "specular 'b' is a non numeric value on the MATERIALS block";
			else if (b < 0 || b > 1)
				return "specular 'b' must be a value between 0 and 1 on the MATERIALS block";
			specularComponent.push(b);
			// A.
			var a = this.reader.getFloat(materialSpecs[specularIndex], 'a');
			if (a == null)
				return "unable to parse A component of specular reflection for material with ID = " + materialID;
			else if (isNaN(a))
				return "specular 'a' is a non numeric value on the MATERIALS block";
			else if (a < 0 || a > 1)
				return "specular 'a' must be a value between 0 and 1 on the MATERIALS block";
			specularComponent.push(a);

			// Diffuse component.
			var diffuseIndex = nodeNames.indexOf("diffuse");
			if (diffuseIndex == -1)
				return "no diffuse component defined for material with ID = " + materialID;
			var diffuseComponent = [];
			// R.
			r = this.reader.getFloat(materialSpecs[diffuseIndex], 'r');
			if (r == null)
				return "unable to parse R component of diffuse reflection for material with ID = " + materialID;
			else if (isNaN(r))
				return "diffuse 'r' is a non numeric value on the MATERIALS block";
			else if (r < 0 || r > 1)
				return "diffuse 'r' must be a value between 0 and 1 on the MATERIALS block";
			diffuseComponent.push(r);
			// G.
			g = this.reader.getFloat(materialSpecs[diffuseIndex], 'g');
			if (g == null)
				return "unable to parse G component of diffuse reflection for material with ID = " + materialID;
			else if (isNaN(g))
				return "diffuse 'g' is a non numeric value on the MATERIALS block";
			else if (g < 0 || g > 1)
				return "diffuse 'g' must be a value between 0 and 1 on the MATERIALS block";
			diffuseComponent.push(g);
			// B.
			b = this.reader.getFloat(materialSpecs[diffuseIndex], 'b');
			if (b == null)
				return "unable to parse B component of diffuse reflection for material with ID = " + materialID;
			else if (isNaN(b))
				return "diffuse 'b' is a non numeric value on the MATERIALS block";
			else if (b < 0 || b > 1)
				return "diffuse 'b' must be a value between 0 and 1 on the MATERIALS block";
			diffuseComponent.push(b);
			// A.
			a = this.reader.getFloat(materialSpecs[diffuseIndex], 'a');
			if (a == null)
				return "unable to parse A component of diffuse reflection for material with ID = " + materialID;
			else if (isNaN(a))
				return "diffuse 'a' is a non numeric value on the MATERIALS block";
			else if (a < 0 || a > 1)
				return "diffuse 'a' must be a value between 0 and 1 on the MATERIALS block";
			diffuseComponent.push(a);

			// Ambient component.
			var ambientIndex = nodeNames.indexOf("ambient");
			if (ambientIndex == -1)
				return "no ambient component defined for material with ID = " + materialID;
			var ambientComponent = [];
			// R.
			r = this.reader.getFloat(materialSpecs[ambientIndex], 'r');
			if (r == null)
				return "unable to parse R component of ambient reflection for material with ID = " + materialID;
			else if (isNaN(r))
				return "ambient 'r' is a non numeric value on the MATERIALS block";
			else if (r < 0 || r > 1)
				return "ambient 'r' must be a value between 0 and 1 on the MATERIALS block";
			ambientComponent.push(r);
			// G.
			g = this.reader.getFloat(materialSpecs[ambientIndex], 'g');
			if (g == null)
				return "unable to parse G component of ambient reflection for material with ID = " + materialID;
			else if (isNaN(g))
				return "ambient 'g' is a non numeric value on the MATERIALS block";
			else if (g < 0 || g > 1)
				return "ambient 'g' must be a value between 0 and 1 on the MATERIALS block";
			ambientComponent.push(g);
			// B.
			b = this.reader.getFloat(materialSpecs[ambientIndex], 'b');
			if (b == null)
				return "unable to parse B component of ambient reflection for material with ID = " + materialID;
			else if (isNaN(b))
				return "ambient 'b' is a non numeric value on the MATERIALS block";
			else if (b < 0 || b > 1)
				return "ambient 'b' must be a value between 0 and 1 on the MATERIALS block";
			ambientComponent.push(b);
			// A.
			a = this.reader.getFloat(materialSpecs[ambientIndex], 'a');
			if (a == null)
				return "unable to parse A component of ambient reflection for material with ID = " + materialID;
			else if (isNaN(a))
				return "ambient 'a' is a non numeric value on the MATERIALS block";
			else if (a < 0 || a > 1)
				return "ambient 'a' must be a value between 0 and 1 on the MATERIALS block";
			ambientComponent.push(a);

			// Emission component.
			var emissionIndex = nodeNames.indexOf("emission");
			if (emissionIndex == -1)
				return "no emission component defined for material with ID = " + materialID;
			var emissionComponent = [];
			// R.
			r = this.reader.getFloat(materialSpecs[emissionIndex], 'r');
			if (r == null)
				return "unable to parse R component of emission for material with ID = " + materialID;
			else if (isNaN(r))
				return "emisson 'r' is a non numeric value on the MATERIALS block";
			else if (r < 0 || r > 1)
				return "emisson 'r' must be a value between 0 and 1 on the MATERIALS block";
			emissionComponent.push(r);
			// G.
			g = this.reader.getFloat(materialSpecs[emissionIndex], 'g');
			if (g == null)
				return "unable to parse G component of emission for material with ID = " + materialID;
			if (isNaN(g))
				return "emisson 'g' is a non numeric value on the MATERIALS block";
			else if (g < 0 || g > 1)
				return "emisson 'g' must be a value between 0 and 1 on the MATERIALS block";
			emissionComponent.push(g);
			// B.
			b = this.reader.getFloat(materialSpecs[emissionIndex], 'b');
			if (b == null)
				return "unable to parse B component of emission for material with ID = " + materialID;
			else if (isNaN(b))
				return "emisson 'b' is a non numeric value on the MATERIALS block";
			else if (b < 0 || b > 1)
				return "emisson 'b' must be a value between 0 and 1 on the MATERIALS block";
			emissionComponent.push(b);
			// A.
			a = this.reader.getFloat(materialSpecs[emissionIndex], 'a');
			if (a == null)
				return "unable to parse A component of emission for material with ID = " + materialID;
			else if (isNaN(a))
				return "emisson 'a' is a non numeric value on the MATERIALS block";
			else if (a < 0 || a > 1)
				return "emisson 'a' must be a value between 0 and 1 on the MATERIALS block";
			emissionComponent.push(a);

			// Creates material with the specified characteristics.
			var newMaterial = new CGFappearance(this.scene);
			newMaterial.setShininess(shininess);
			newMaterial.setAmbient(ambientComponent[0], ambientComponent[1], ambientComponent[2], ambientComponent[3]);
			newMaterial.setDiffuse(diffuseComponent[0], diffuseComponent[1], diffuseComponent[2], diffuseComponent[3]);
			newMaterial.setSpecular(specularComponent[0], specularComponent[1], specularComponent[2], specularComponent[3]);
			newMaterial.setEmission(emissionComponent[0], emissionComponent[1], emissionComponent[2], emissionComponent[3]);
			this.materials[materialID] = newMaterial;
			oneMaterialDefined = true;
			
        }
		
		if (!oneMaterialDefined)
        return "at least one material must be defined on the MATERIALS block";

        //this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':                        
						var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
						
                    case 'rotate':
						transfMatrix = this.parseRotationAxis(grandChildren[j],transfMatrix, "rotation transformation for ID " + transformationID);
                        break;
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        console.log(children.length);

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            console.log(i);

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
		grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'bigtorus' && grandChildren[0].nodeName != 'plane' && grandChildren[0].nodeName != 'patch')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere, torus, big torus or a nurb)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
			
			if (primitiveType == 'cylinder') {
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
				
				// stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var cylin = new Cylinder2(this.scene, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylin;
            }
            if (primitiveType == 'sphere') {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
				
				// stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks)))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            if (primitiveType == 'torus') {
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner radius of the primitive coordinates for ID = " + primitiveId;

                //outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer radius of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;
				
				// loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops)))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);

                this.primitives[primitiveId] = torus;
            }
            if(primitiveType == 'plane')
            {
                var npartsU= this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;

                var npartsV= this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;

                var plane = new Plane(this.scene, npartsU, npartsV);
                this.primitives[primitiveId] = plane;

            }

            if(primitiveType == 'patch')
            {
                var npointsU= this.reader.getFloat(grandChildren[0], 'npointsU');
                if (!(npointsU != null && !isNaN(npointsU)))
                return "unable to parse npointsU of the primitive coordinates for ID = " + primitiveId;

                var npointsV= this.reader.getFloat(grandChildren[0], 'npointsV');
                if (!(npointsV != null && !isNaN(npointsV)))
                return "unable to parse npointsV of the primitive coordinates for ID = " + primitiveId;

                var npartsU= this.reader.getFloat(grandChildren[0], 'npartsU');
                if (!(npartsU != null && !isNaN(npartsU)))
                return "unable to parse npartsU of the primitive coordinates for ID = " + primitiveId;

                var npartsV= this.reader.getFloat(grandChildren[0], 'npartsV');
                if (!(npartsV != null && !isNaN(npartsV)))
                return "unable to parse npartsV of the primitive coordinates for ID = " + primitiveId;


                var controlPoints = [];
                var cP=grandChildren[0].children;

                for(var j=0; j<cP.length; j++)
                {

                    var point = []; 
                    var xx= this.reader.getFloat(cP[j], 'xx');
                    if (!(xx != null && !isNaN(xx)))
                    return "unable to parse xx of the primitive coordinates for ID = " + primitiveId;
                    
                    var yy= this.reader.getFloat(cP[j], 'yy');
                    if (!(yy != null && !isNaN(yy)))
                    return "unable to parse yy of the primitive coordinates for ID = " + primitiveId;

                    var zz= this.reader.getFloat(cP[j], 'zz');
                    if (!(zz != null && !isNaN(zz)))
                    return "unable to parse zz of the primitive coordinates for ID = " + primitiveId;


                    point.push(xx);
                    point.push(yy);
                    point.push(zz);
                    controlPoints.push(point);
                }

                var patch = new Patch(this.scene, npointsU, npointsV, controlPoints, npartsU, npartsV);
                this.primitives[primitiveId] = patch;
            }
			
	

        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var nodeNames = [];
		var transgrandChildren=[];
        var materialsgrandChildren=[];
        var animationgrandChildren=[];
		var childrengrandchildren=[];
		var texturegrandChieldren=[];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {
			

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            var animationsIndex=nodeNames.indexOf("animationref");

            var animationPresent=false;
            if(!(animationsIndex!=1)){
                var animationPresent=true;
            }

            //this.onXMLMinorError("To do: Parse components.");
            
			// Transformations
			transgrandChildren=grandChildren[transformationIndex].children;
			var transfMatrix=mat4.create();
			
			for(var t=0;t<transgrandChildren.length;t++){
				switch(transgrandChildren[t].nodeName){
					case 'translate':
                        var coordinates = this.parseCoordinates3D(transgrandChildren[t], "translate transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':                        
						var coordinates = this.parseCoordinates3D(transgrandChildren[t], "scale transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
						
                    case 'rotate':
						transfMatrix = this.parseRotationAxis(transgrandChildren[t],transfMatrix, "rotation transformation for component ID " + componentID);
                        break;
				}
			}

            // Materials
			
			var materialID=[];
			materialsgrandChildren=grandChildren[materialsIndex].children;
			
				for(var p=0;p<materialsgrandChildren.length;p++){
					
					var tempmaterial=this.reader.getString(materialsgrandChildren[p],'id');
			
					materialID.push(tempmaterial);
				}
				
				
            // Texture
			
			var ComponentTexture=[];
			
			grandChildren[textureIndex];
			
				
					
					var textureID=this.reader.getString(grandChildren[textureIndex],'id');
			
					var lengthS=this.reader.getString(grandChildren[textureIndex],'length_s');
			
					var lengthT=this.reader.getString(grandChildren[textureIndex],'length_t');
					
					
					ComponentTexture.push(textureID);
					ComponentTexture.push(lengthS);
					ComponentTexture.push(lengthT);
				
				
			


		  // Children
		  var ComponentChildren=[];
			childrengrandchildren=grandChildren[childrenIndex].children
			for(var k=0;k<childrengrandchildren.length;k++){
				var childrenID=this.reader.getString(childrengrandchildren[k],'id');
				ComponentChildren.push(childrenID);
			}
		  
			
			// Animations
            if(animationPresent){
                var animationID=[];
                       
                var animationRef=this.reader.getString(grandChildren[animationsIndex],'id');
               
                animationID.push(animationRef);
                   
                var tempComponent=new MyComponent(componentID,transfMatrix,materialID,ComponentTexture,ComponentChildren,animationRef);
                }
                else{
               
                var tempComponent=new MyComponent(componentID,transfMatrix,materialID,ComponentTexture,ComponentChildren,null);
                }
               
                this.components.push(tempComponent);
        }
    }


    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
  parseAnimations(animationsNode){
    var children = animationsNode.children;

    this.animations = [];
   
    var grandGrandchildren =[];
    var grandChildren = [];
    var nodeNames = [];
    var transgrandChildren=[];
    var materialsgrandChildren=[];
    var childrengrandchildren=[];
    var texturegrandChieldren=[];
   
    // Any number of animations.
    if(children.length>0){
        for (var i = 0; i < children.length; i++) {
            this.keyFrameGroup=[];

            if (children[i].nodeName != "animation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current animation.
            var animationID = this.reader.getString(children[i], 'id');
            if (animationID == null)
                return "no ID defined for animationID";

            // Checks for repeated IDs.
            if (this.animations[animationID] != null)
                return "ID must be unique for each animation (conflict: ID = " + componentID + ")";


           
           
            grandChildren = children[i].children;
           
           

           
            for (var j = 0; j < grandChildren.length; j++) {
                this.keyframes=[];
                var nodeNames = [];
               
                // Get instant of the current keyframe.
                var keyframeInstant = this.reader.getFloat(grandChildren[j], 'instant');
               
                if (keyframeInstant == null)
                    return "no Instant defined for keyframe";
               
                // Checks for repeated IDs.
                for(var k=0;k<this.animations.length;k++){
                    if (this.animations[k][0] == keyframeInstant)
                        return "Instant must be unique for each keyframe in one animation (conflict: ID = " + keyframeInstant + ")";
                }
                this.keyframes.push(keyframeInstant);
               
                grandGrandchildren=grandChildren[j].children;
                for(var k=0;k<grandGrandchildren.length;k++){
                    nodeNames.push(grandGrandchildren[k].nodeName);
                }
               
                var tanslateIndex=nodeNames.indexOf("translate");
                var rotateIndex=nodeNames.indexOf("rotate");
                var scaleIndex=nodeNames.indexOf("scale");
               
               
               
               
                var translateX=this.reader.getFloat(grandGrandchildren[tanslateIndex],'x');
                var translateY=this.reader.getFloat(grandGrandchildren[tanslateIndex],'y');
                var translateZ=this.reader.getFloat(grandGrandchildren[tanslateIndex],'z');
                var rotateX=this.reader.getFloat(grandGrandchildren[rotateIndex],'angle_x');
                var rotateY=this.reader.getFloat(grandGrandchildren[rotateIndex],'angle_y');
                var rotateZ=this.reader.getFloat(grandGrandchildren[rotateIndex],'angle_z');
                var scaleX=this.reader.getFloat(grandGrandchildren[scaleIndex],'x');
                var scaleY=this.reader.getFloat(grandGrandchildren[scaleIndex],'y');
                var scaleZ=this.reader.getFloat(grandGrandchildren[scaleIndex],'z');
               
               
                this.keyframes.push([rotateX,rotateY,rotateZ]);
                this.keyframes.push([scaleX,scaleY,scaleZ]);
                this.keyframes.push([translateX,translateY,translateZ]);
               
               
                this.keyFrameGroup.push(this.keyframes);
               
            }

           
        var tempAnimation=new MyKeyframeAnimation(this.scene,animationID,this.keyFrameGroup);
       
        this.animations.push(tempAnimation);
           
           

           
               
       


         
        }
    }
   
}


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }
	
	
	/**
     * Parse the coordinates from a node with ID = id and returns matrix of rotation
     * @param {block element} node
	 * @param {bloack element} initial matrix
     * @param {message to be displayed in case of error} messageError
     */
	parseRotationAxis(node, transfMatrix,messageError){
		var degrees=this.reader.getFloat(node, 'angle');
		if (!(degrees != null && !isNaN(degrees)))
			return "unable to parse degrees coordinates of the " + messageError;
		
		var rotationMatrix=mat4.create();
		var axisreader=this.reader.getString(node,'axis');
		switch(axisreader){
			
			case 'x':
				rotationMatrix = mat4.rotateX(transfMatrix,transfMatrix,DEGREE_TO_RAD*degrees);
			break;
					
			case 'y':
				rotationMatrix = mat4.rotateY(transfMatrix,transfMatrix,DEGREE_TO_RAD*degrees);
			break;
							
			case 'z':
				rotationMatrix = mat4.rotateZ(transfMatrix,transfMatrix,DEGREE_TO_RAD*degrees);
			break;
							
			default:
			break;
		}
	
	
	
		return rotationMatrix;
	}

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }
	
	logPicking() {
		if (this.pickMode == false) {
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i = 0; i < this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj) {
						var customId = this.pickResults[i][1];
						console.log("Picked object: " + obj + ", with pick id " + customId);						
					}
				}
				this.pickResults.splice(0, this.pickResults.length);
			}
		}
	}
    
 
    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
    this.logPicking();
    this.displayLoop('All','steelMaterial',['groundTexture']);
    this.test();
    }
    test()
    {
        this.scene.game.startGame("Player vs Player","Easy");
        console.log(this.scene.game.board);
        console.log(this.scene.game.currentState);
        this.scene.game.firstMove("B",19);
        console.log(this.scene.game.board);
        console.log(this.scene.game.currentState);
        this.scene.game.movePiece("Up","B");
        console.log(this.scene.game.board);
        console.log(this.scene.game.currentState);
       

    }
	
	
	displayLoop(nodeID,fathermaterialID, fathertextureID){

		if (this.primitives[nodeID] != null){
		this.primitives[nodeID].display();
        }
		
		for (var q=0;q<this.components.length;q++){
				this.objects.push(new CGFplane(this.scene));
				this.scene.registerForPick(q, this.objects[q]);
				this.objects[q].display();
				if(this.components[q].id==nodeID){
				var nodeChieldren=this.components[q].children;
					for (var f=0;f<nodeChieldren.length;f++){
						this.scene.pushMatrix();
						if(this.components[q].texture[0]=='inherit'){
							this.tex=this.textures[fathertextureID];
							var passingTextureID=fathertextureID;
						}
						else{
							this.tex = this.textures[this.components[q].texture[0]];
							var passingTextureID=this.components[q].texture[0];
						}
						
						if(this.components[q].materials=='inherit'){
							this.mat=this.materials[fathermaterialID];
							var passingMaterialID=fathermaterialID;

						}
						else{
							this.mat= this.materials[this.components[q].materials];
							var passingMaterialID=this.components[q].materials;
						}
						this.mat.apply();
						this.tex.bind();
						this.scene.multMatrix(this.components[q].transformations);
						for(var x=0;x<this.animations.length;x++){
							if(this.animations[x].id==this.components[q].animation){
								this.animations[x].apply();
							}
						}
						this.displayLoop(nodeChieldren[f],passingMaterialID,passingTextureID);
						this.scene.popMatrix();
					}
				}
			
		}
        
	}
	
	
}


