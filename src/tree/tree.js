import React, { Component } from 'react';
import * as d3 from "d3";
import axios from 'axios';

class Tree extends Component {

    constructor(props){

        super(props);

        let swidth = 1280;
        let sheight = 500;
        let smargin =  { top: 10, left: 50, bottom: 40, right: 10 };

        this.state ={
            url: 'https://gist.githubusercontent.com/FVelasquezM/0e3a3df5e52c19f24d9b7366a3b6f553/raw/8f7b41b4feb4e5844e086abd3bfe1741b91bea44/test-data.json',
            newNumber: 0,
            svg: null,
            file: null,
            data: [
                { value: 1 },
                { value: 5 },
                { value: 2 },
                { value: 4 },
                { value: 20 }
            ],
            width: swidth,
            height: sheight,
            margin: smargin,
            nodeRadius: 10,
            currentTree: null,
            iwidth: swidth - smargin.left - smargin.right,
            iheight: sheight - smargin.top - smargin.bottom
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUrlGet = this.handleUrlGet.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.handleFileChange =  this.handleFileChange.bind(this);
    }

    handleChange(event) {
        let currentState = this.state;
        currentState.newNumber = event.target.value;
        this.setState(currentState);
    }

    handleSubmit(event){
        alert('A number was submitted: ' + this.state.newNumber);



        //Calcular nuevo árbol
        this.insertInTree(this.state.currentTree, parseInt(this.state.newNumber));

        let currentState = this.state;
        currentState.data.push({value: this.state.newNumber});


        console.log("After insert");
        console.log(this.state.currentTree);

        //Volver a dibujar el árbol, ahora con el nuevo árbol
        let dx = this.state.iwidth / this.state.data.length ;
        let dy = this.state.iheight / this.state.data.length ;
        this.drawTree(this.state.currentTree, dx, dy)
        

        event.preventDefault();

    }

    handleUrlChange(event){
        let currentState = this.state;
        currentState.url = event.target.value;
        this.setState(currentState);

        console.log(this.state);
    }

    handleUrlGet(event){

        axios.get(this.state.url)
            .then(res => {

                let currentState = this.state;
                currentState.data = res.data;
                this.setState(currentState);

                //Calcular árbol completamente nuevo
                let newTree = this.constructTree(currentState.data);

                currentState = this.state;
                currentState.currentTree = newTree;
                this.setState(currentState);

                console.log("After fetch");
                console.log(this.state.currentTree);
                console.log(this.state.data);



                //Volver a dibujar el árbol, ahora con el nuevo árbol
                let dx = this.state.iwidth / this.state.data.length ;
                let dy = this.state.iheight / this.state.data.length ;
                this.drawTree(this.state.currentTree, dx, dy)

            })

        event.preventDefault();
    }

    handleFileChange(event){

        let file = event.target.files[0] ;

        console.log(file);



        var reader = new FileReader();
        reader.onload = (e) => {
            var contents = e.target.result;
            console.log(contents);

            let data = JSON.parse(contents);
            console.log(data);
            
            let currentState = this.state;
            currentState.data = data;
            this.setState(currentState);

            //Calcular árbol completamente nuevo
            let newTree = this.constructTree(currentState.data);

            currentState = this.state;
            currentState.currentTree = newTree;
            this.setState(currentState);

            console.log("After fetch");
            console.log(this.state.currentTree);
            console.log(this.state.data);



            //Volver a dibujar el árbol, ahora con el nuevo árbol
            let dx = this.state.iwidth / this.state.data.length ;
            let dy = this.state.iheight / this.state.data.length ;
            this.drawTree(this.state.currentTree, dx, dy)
         };

        reader.readAsText(file);

    }

    componentDidMount() {


        const canvas = d3.select("#canvas");
        const getsvg = canvas.append("svg");

        let state = this.state;
        state.svg = getsvg;
        this.setState(state);

        this.drawFirstTime();
    }

    drawFirstTime() {

        this.state.svg.attr("width", this.state.width);
        this.state.svg.attr("height", this.state.height);

        

        //Dibuja árbol con datos por defecto
        let defaultTree = this.constructTree(this.state.data);

        console.log("TREE ROOT");
        console.log(defaultTree);



        let dx = this.state.iwidth / this.state.data.length;
        let dy = this.state.iheight / this.state.data.length;

        this.drawTree(defaultTree, dx, dy)

        let state = this.state;
        state.currentTree = defaultTree;
        this.setState(state);
    }

    insertInTree(treeRoot, number) {

        this.insertNode(treeRoot, { value: number });

    }

    drawTree(treeRoot, dx, dy) {

        let nodeDrawData = this.computeTreeDrawData(treeRoot, dx, dy);

        console.log("DRAW INFO");
        console.log(nodeDrawData);

        d3.select("svg").selectAll("*").remove();

        //Dibujar nodos
        const nodesSel = this.state.svg.selectAll(".node")
            .data(nodeDrawData.nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", this.state.nodeRadius)
            .attr("color", "black");



        //Dibujar arcos
        const linksSel = this.state.svg.selectAll(".link")
            .data(nodeDrawData.links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("stroke-width", 2);


        nodesSel.attr("cx", d => d.cx).attr("cy", d => d.cy);


        this.state.svg.selectAll("node").data(nodeDrawData.nodes).enter()
            .append("text")
            .attr("x", d => d.cx)
            .attr("y", d => d.cy+20)
            .text( d => d.content.value)
            .attr("font-family", "sans-serif")
            .attr("font-size", d => `10px`)
            .attr("fill", "black")
            .attr("class", "text");

        linksSel.attr("x1", l => l.sourcecx).attr("y1", l => l.sourcecy)
            .attr("x2", l => l.destcx)
            .attr("y2", l => l.destcy)
            .attr("stroke", "black");

        console.log("NODES");
        console.log(nodeDrawData.nodes);

        console.log("LINKS");
        console.log(nodeDrawData.links);

        //console.log("FS");
        //console.log(d3.forceSimulation(nodeDrawData.nodes));


        //const simulation = d3.forceSimulation(nodeDrawData.nodes)
        //    .force("x", d3.forceX(this.state.width/2))
        //    .force("y", d3.forceY(this.state.height/2))
        //   .force("collide", d3.forceCollide(this.state.noderadiusr) )
        //   .on("tick", ticked);  
        //    //.force("links", d3.forceLink(nodeDrawData.links));
        //    .force("x", d3.forceX(this.state.width/2))
        //   .force("y", d3.forceY(this.state.height/2))  
        //   .force("collide", d3.forceCollide(this.state.nodeRadius) )
        //    .force("charge", d3.forceManyBody().strength(-100))  
        //    .on("tick", ticked);
        this.state.svg.node();

//        var attractForce = d3.forceManyBody().strength(80).distanceMax(400).distanceMin(80);
//var collisionForce = d3.forceCollide(12).strength(1).iterations(100);

//var simulation = d3.forceSimulation(nodeDrawData.nodes)
//.alphaDecay(0.01)
//.force("attractForce",attractForce)
//.force("collisionForce",collisionForce)
//.on("tick", ticked);
  

    }

    computeTreeDrawDataRec(treeRoot, drawData, prevcx, prevcy, dx, dy) {


        if (treeRoot === null) {
            return;
        }

        if (treeRoot.left !== null) {

            let newcx = prevcx - dx;
            let newcy = prevcy + dy;

            drawData.links.push({
                sourcecx: prevcx,
                destcx: newcx,
                sourcecy: prevcy,
                destcy: newcy
            });

            drawData.nodes.push({
                content: treeRoot.left.content,
                cx: newcx,
                cy: newcy
            });

            this.computeTreeDrawDataRec(treeRoot.left, drawData, drawData.nodes[drawData.nodes.length - 1].cx, drawData.nodes[drawData.nodes.length - 1].cy, dx, dy);
        }
        if (treeRoot.right !== null) {

            let newcx = prevcx + dx;
            let newcy = prevcy + dy;

            drawData.links.push({
                sourcecx: prevcx,
                destcx: newcx,
                sourcecy: prevcy,
                destcy: newcy
            });

            drawData.nodes.push({
                content: treeRoot.right.content,
                cx: newcx,
                cy: newcy
            });
            this.computeTreeDrawDataRec(treeRoot.right, drawData, drawData.nodes[drawData.nodes.length - 1].cx, drawData.nodes[drawData.nodes.length - 1].cy, dx, dy);
        }

        return;
    }

    computeTreeDrawData(treeRoot, dx, dy) {

        let drawData = {
            nodes: [],
            links: []
        };

        drawData.nodes.push({
            content: treeRoot.content,
            cx: this.state.width / 2,
            cy: this.state.margin.top
        });
        this.computeTreeDrawDataRec(treeRoot, drawData, drawData.nodes[0].cx, drawData.nodes[0].cy, dx, dy);


        return drawData;

    }

    insertNode(root, nodeContent) {

        if (root === null) {
            root = {
                content: nodeContent,
                left: null,
                right: null
            }
        } else if (nodeContent.value <= root.content.value) {
            root.left = this.insertNode(root.left, nodeContent);
        } else if (nodeContent.value > root.content.value) {
            root.right = this.insertNode(root.right, nodeContent);
        }

        return root;
    }

    constructTree(data) {

        //Insertar el primer elemento de los datos como raíz

        if (data.length > 0) {

            let root = {
                content: data[0],
                left: null,
                right: null
            };

            for (let i = 1; i < data.length; i++) {
                root = this.insertNode(root, data[i]);
            }

            return root;
        } else {
            console.log("ERROR CONSTRUCTING TREE, EMPTY DATA")
        }
    }


    render() {
        return (
            <div>
                <div id="canvas">
                </div>
                <form ref="form" onSubmit={this.handleSubmit}>
                    <input type="number" onChange={this.handleChange}/>
                    <button type="submit">Add Node with value</button>
                </form>
                <form ref="form" onSubmit={this.handleUrlGet}>
                    <input type="text" onChange={this.handleUrlChange} value={this.state.url}/>
                    <button type="submit">Fetch JSON from URL</button>
                </form>
                <input id="fileinput" type="file" onChange={ (e) => this.handleFileChange(e) } />
            </div>
        );
    }

}

export default Tree;

/*<FilePicker 
                    extensions={['json', 'JSON']} 
                    onChange={FileObject => (//this.handleFileLoad(FileObject)
                        console.log(FileObject))} 
                    onError={errMsg => ( console.log("error"))}
                >
                    <button>
                        Upload from JSON file
                    </button>
                </FilePicker>*/