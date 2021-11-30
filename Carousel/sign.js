class Sign {
  constructor(gl, program) {
    this.gl = gl; // WebGL graphics environment
    this.program = program; // The shader program

    var points = []; // Vertex location data
    var colors = []; // Vertex color data
    var normals = []; // Vertex normal data
    var texCoords = []; // Vertex texture coordinate data
    var texindex = []; // Texture Index for which texture to map or not
    var size = 60;
    var depth = 120;
    // The
    points.push(vec3(0, 0, depth));
    points.push(vec3(0, size, depth));
    points.push(vec3(size, 0, depth));
    points.push(vec3(size, 0, depth));
    points.push(vec3(0, size, depth));
    points.push(vec3(size, size, depth));

    // Calculate the normal for this sign
    var normal = cross(subtract(vec3(0, size, depth), vec3(0, 0, depth)), subtract(vec3(size, 0, depth), vec3(0, 0, depth)));
    for (var i = 0; i < 6; i++) {
      normals.push(normal);
      colors.push(vec3(0.8, 0.8, 0.8)); // Add color while we're here
    }

    // Finally add the texure coordinates
    texCoords.push(vec2(1.0, 0.0));
    texCoords.push(vec2(1.0, 1.0));
    texCoords.push(vec2(0.0, 0.0));
    texCoords.push(vec2(0.0, 0.0));
    texCoords.push(vec2(1.0, 1.0));
    texCoords.push(vec2(0.0, 1.0));

    for (var i = 0; i < 12; i++) {
      texindex.push(1.0); // We want the MGR texture
    }

    // Push Vertex Location Data to GPU
    this.vbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Push Color Data to GPU
    this.cbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Push Normal Data to GPU
    this.nbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    // Push Texel Data to GPU
    this.tbufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tbufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    // Push Texture Index Data to GPU
    this.tibufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tibufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texindex), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return;
  }

  render() {
    var gl = this.gl; // Since we are seperated with classes

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Connect the vertex data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbufferID);
    var vPosition = gl.getAttribLocation(this.program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Connect the color data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbufferID);
    var vColor = gl.getAttribLocation(this.program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Connect the normal data to the program shader variables
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nbufferID);
    var vNormal = gl.getAttribLocation(this.program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Draw the sign
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return;
  }
}